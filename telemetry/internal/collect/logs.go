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
	Logs    []string `json:"logs"`
	Error   *string  `json:"error,omitempty"`
}

func ServiceLogsFor(cfg config.Config, serviceName, dockerContainer string) ServiceLogs {
	result := ServiceLogs{Service: serviceName}

	lines, err := fetchLogLines(cfg, serviceName, dockerContainer)
	if err != nil {
		msg := err.Error()
		result.Error = &msg
		return result
	}

	result.Logs = lines
	return result
}

func fetchLogLines(cfg config.Config, unit, container string) ([]string, error) {
	var cmd *exec.Cmd

	switch cfg.LogMode {
	case "docker":
		cmd = exec.Command(
			"docker", "logs", "--tail", fmt.Sprintf("%d", cfg.LogLines), container,
		)
	default:
		cmd = exec.Command(
			"journalctl",
			"-u", unit,
			"-n", fmt.Sprintf("%d", cfg.LogLines),
			"--no-pager",
			"-o", "cat",
		)
	}

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
