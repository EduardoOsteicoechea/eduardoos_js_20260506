package collect

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/eduardoos/telemetry/internal/config"
)

type PortListener struct {
	Port     int     `json:"port"`
	Listening bool   `json:"listening"`
	Address  string  `json:"address,omitempty"`
	Process  string  `json:"process,omitempty"`
	PID      string  `json:"pid,omitempty"`
	Raw      string  `json:"raw,omitempty"`
}

type PortsBlock struct {
	Backend    PortListener `json:"backend"`
	Documenter PortListener `json:"documenter"`
	Chatbot    PortListener `json:"chatbot"`
	PostsDb    PortListener `json:"posts_db"`
	S3         PortListener `json:"s3"`
	Telemetry  PortListener `json:"telemetry"`
}

var ssLinePattern = regexp.MustCompile(
	`^LISTEN\s+\d+\s+\d+\s+(\S+):(\d+)\s+.*users:\(\("([^"]+)",pid=(\d+)`,
)

func PortsStatus(cfg config.Config) PortsBlock {
	listeners := map[int]PortListener{}
	for _, line := range ssListenLines() {
		if parsed, ok := parseSSLine(line); ok {
			listeners[parsed.Port] = parsed
		}
	}

	return PortsBlock{
		Backend:    portOrEmpty(listeners, cfg.BackendPort),
		Documenter: portOrEmpty(listeners, cfg.DocumenterPort),
		Chatbot:    portOrEmpty(listeners, cfg.ChatbotPort),
		PostsDb:    portOrEmpty(listeners, cfg.PostsDbPort),
		S3:         portOrEmpty(listeners, cfg.S3Port),
		Telemetry:  portOrEmpty(listeners, cfg.TelemetryPort),
	}
}

func portOrEmpty(listeners map[int]PortListener, port int) PortListener {
	if found, ok := listeners[port]; ok {
		return found
	}
	return PortListener{Port: port, Listening: false}
}

func ssListenLines() []string {
	out, err := exec.Command("ss", "-tlnp").Output()
	if err != nil {
		return nil
	}

	var lines []string
	for _, line := range strings.Split(string(out), "\n") {
		if strings.Contains(line, "LISTEN") {
			lines = append(lines, line)
		}
	}
	return lines
}

func parseSSLine(line string) (PortListener, bool) {
	match := ssLinePattern.FindStringSubmatch(line)
	if len(match) < 5 {
		// Fallback: match port only
		if strings.Contains(line, ":8080") || strings.Contains(line, ":8090") || strings.Contains(line, ":8100") || strings.Contains(line, ":8110") || strings.Contains(line, ":8120") || strings.Contains(line, ":8130") {
			return PortListener{Listening: true, Raw: strings.TrimSpace(line)}, true
		}
		return PortListener{}, false
	}

	port, _ := strconv.Atoi(match[2])
	return PortListener{
		Port:      port,
		Listening: true,
		Address:   match[1] + ":" + match[2],
		Process:   match[3],
		PID:       match[4],
		Raw:       strings.TrimSpace(line),
	}, true
}

// Broad fallback parser when regex fails (some ss output formats).
func parseSSLineBroad(line string, ports []int) map[int]PortListener {
	result := map[int]PortListener{}
	for _, port := range ports {
		needle := ":" + strconv.Itoa(port)
		if !strings.Contains(line, needle) || !strings.Contains(line, "LISTEN") {
			continue
		}
		entry := PortListener{
			Port:      port,
			Listening: true,
			Raw:       strings.TrimSpace(line),
		}
		if idx := strings.Index(line, `users:(("`); idx >= 0 {
			rest := line[idx+len(`users:(("`):]
			if end := strings.Index(rest, `"`); end > 0 {
				entry.Process = rest[:end]
			}
			if pidIdx := strings.Index(line, ",pid="); pidIdx >= 0 {
				pidPart := line[pidIdx+5:]
				if end := strings.Index(pidPart, ","); end > 0 {
					entry.PID = pidPart[:end]
				} else if end := strings.Index(pidPart, ")"); end > 0 {
					entry.PID = pidPart[:end]
				}
			}
		}
		result[port] = entry
	}
	return result
}

func PortsStatusWithFallback(cfg config.Config) PortsBlock {
	block := PortsStatus(cfg)

	needsFallback := !block.Backend.Listening && !block.Documenter.Listening && !block.Chatbot.Listening && !block.PostsDb.Listening && !block.S3.Listening && !block.Telemetry.Listening
	if !needsFallback {
		return block
	}

	ports := []int{cfg.BackendPort, cfg.DocumenterPort, cfg.ChatbotPort, cfg.PostsDbPort, cfg.S3Port, cfg.TelemetryPort}
	merged := map[int]PortListener{}
	for _, line := range ssListenLines() {
		for port, entry := range parseSSLineBroad(line, ports) {
			merged[port] = entry
		}
	}

	if len(merged) == 0 {
		return block
	}

	return PortsBlock{
		Backend:    pickListener(merged, cfg.BackendPort, block.Backend),
		Documenter: pickListener(merged, cfg.DocumenterPort, block.Documenter),
		Chatbot:    pickListener(merged, cfg.ChatbotPort, block.Chatbot),
		PostsDb:    pickListener(merged, cfg.PostsDbPort, block.PostsDb),
		S3:         pickListener(merged, cfg.S3Port, block.S3),
		Telemetry:  pickListener(merged, cfg.TelemetryPort, block.Telemetry),
	}
}

func pickListener(merged map[int]PortListener, port int, fallback PortListener) PortListener {
	if entry, ok := merged[port]; ok {
		return entry
	}
	return fallback
}
