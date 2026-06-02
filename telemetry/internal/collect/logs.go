package collect

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"

	"github.com/eduardoos/telemetry/internal/config"
)

type ServiceLogs struct {
	Service string   `json:"service"`
	Scope   string   `json:"scope"`
	Logs    []string `json:"logs"`
	Error   *string  `json:"error,omitempty"`
}

func ServiceLogsFor(cfg config.Config, serviceName, dockerContainer string) ServiceLogs {
	result := ServiceLogs{
		Service: serviceName,
		Scope:   "current_run",
	}

	lines, scope, err := fetchLogLines(cfg, serviceName, dockerContainer)
	if err != nil {
		msg := err.Error()
		result.Error = &msg
		result.Scope = "error"
		return result
	}

	result.Scope = scope
	result.Logs = lines
	return result
}

func fetchLogLines(cfg config.Config, unit, container string) ([]string, string, error) {
	switch cfg.LogMode {
	case "docker":
		return fetchDockerLogs(cfg, container)
	default:
		return fetchJournalLogs(cfg, unit)
	}
}

func fetchJournalLogs(cfg config.Config, unit string) ([]string, string, error) {
	since, hasSince := systemdActiveSince(unit)
	args := []string{
		"-u", unit,
		"-n", fmt.Sprintf("%d", cfg.LogLines),
		"--no-pager",
		"-o", "cat",
		"-r",
	}
	scope := fmt.Sprintf("last_%d_lines_newest_first", cfg.LogLines)

	if hasSince {
		args = []string{
			"-u", unit,
			"--since", since,
			"-n", fmt.Sprintf("%d", cfg.LogLines),
			"--no-pager",
			"-o", "cat",
			"-r",
		}
		scope = "since_current_start_newest_first"
	}

	cmd := exec.Command("journalctl", args...)
	lines, err := runLines(cmd)
	return lines, scope, err
}

func fetchDockerLogs(cfg config.Config, container string) ([]string, string, error) {
	args := []string{"logs", "--tail", fmt.Sprintf("%d", cfg.LogLines), container}
	scope := fmt.Sprintf("last_%d_lines", cfg.LogLines)

	if since, ok := dockerStartedAt(container); ok {
		args = []string{"logs", "--since", since, "--tail", fmt.Sprintf("%d", cfg.LogLines), container}
		scope = "since_current_start"
	}

	cmd := exec.Command("docker", args...)
	lines, err := runLines(cmd)
	if err != nil {
		return nil, scope, err
	}

	reverseLines(lines)
	return lines, scope + "_newest_first", nil
}

func systemdActiveSince(unit string) (string, bool) {
	out, err := exec.Command(
		"systemctl", "show", "-p", "ActiveEnterTimestamp", "--value", unit,
	).Output()
	if err != nil {
		return "", false
	}

	since := strings.TrimSpace(string(out))
	if since == "" || since == "n/a" || strings.HasPrefix(since, "0") {
		return "", false
	}
	return since, true
}

func dockerStartedAt(container string) (string, bool) {
	out, err := exec.Command(
		"docker", "inspect", "-f", "{{.State.StartedAt}}", container,
	).Output()
	if err != nil {
		return "", false
	}

	since := strings.TrimSpace(string(out))
	if since == "" || since == "0001-01-01T00:00:00Z" {
		return "", false
	}
	return since, true
}

func runLines(cmd *exec.Cmd) ([]string, error) {
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		detail := strings.TrimSpace(stderr.String())
		if detail == "" {
			detail = err.Error()
		}
		return nil, fmt.Errorf("%s", detail)
	}

	raw := strings.TrimSpace(stdout.String())
	if raw == "" {
		return []string{}, nil
	}

	return strings.Split(raw, "\n"), nil
}

func reverseLines(lines []string) {
	for i, j := 0, len(lines)-1; i < j; i, j = i+1, j-1 {
		lines[i], lines[j] = lines[j], lines[i]
	}
}

// RecentLogWarnings scans newest log lines for stale-looking errors while service is up.
func RecentLogWarnings(block ServiceLogs, active bool) []string {
	if !active || len(block.Logs) == 0 {
		return nil
	}

	check := block.Logs
	if len(check) > 15 {
		check = check[:15]
	}

	joined := strings.ToLower(strings.Join(check, "\n"))
	var warnings []string

	if strings.Contains(joined, "eaddrinuse") {
		warnings = append(warnings, "recent backend logs mention EADDRINUSE (may be from an earlier failed start)")
	}
	if strings.Contains(joined, "module_not_found") {
		warnings = append(warnings, "recent documenter logs mention MODULE_NOT_FOUND (may be from an earlier deploy)")
	}
	if strings.Contains(joined, "failed with result 'exit-code'") {
		warnings = append(warnings, "recent logs mention exit-code failures (check newest lines — service may be healthy now)")
	}

	return warnings
}
