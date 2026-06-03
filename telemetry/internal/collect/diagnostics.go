package collect

import (
	"fmt"
	"strings"

	"github.com/eduardoos/telemetry/internal/config"
)

func EvaluateIssues(
	cfg config.Config,
	services ServicesBlock,
	ports PortsBlock,
	deploy DeployBlock,
	probes ProbesBlock,
) []string {
	var issues []string

	if cfg.LogMode != "docker" {
		if services.LegacyAPI.Exists && services.LegacyAPI.Active {
			issues = append(issues, fmt.Sprintf(
				"legacy unit %s is active (conflicts with backend port %d)",
				services.LegacyAPI.Unit,
				cfg.BackendPort,
			))
		}
		if services.LegacyAPI.Exists && services.LegacyAPI.Enabled != nil && *services.LegacyAPI.Enabled {
			issues = append(issues, fmt.Sprintf("legacy unit %s is still enabled", services.LegacyAPI.Unit))
		}
	}

	if !services.Backend.Active {
		issues = append(issues, fmt.Sprintf("systemd unit %s is not active", services.Backend.Unit))
	}
	if !services.Documenter.Active {
		issues = append(issues, fmt.Sprintf("systemd unit %s is not active", services.Documenter.Unit))
	}
	if !services.Chatbot.Active {
		issues = append(issues, fmt.Sprintf("systemd unit %s is not active", services.Chatbot.Unit))
	}

	if cfg.LogMode != "docker" {
		if !deploy.BackendDist.Exists {
			issues = append(issues, fmt.Sprintf("missing backend build: %s", deploy.BackendDist.Path))
		}
		if !deploy.DocumenterDist.Exists {
			issues = append(issues, fmt.Sprintf("missing documenter build: %s", deploy.DocumenterDist.Path))
		}
	}

	checkPort := func(label string, listener PortListener, expected []string) {
		if !listener.Listening {
			issues = append(issues, fmt.Sprintf("nothing listening on port %d (%s)", listener.Port, label))
			return
		}
		if listener.Process == "" {
			return
		}
		process := strings.ToLower(listener.Process)
		for _, name := range expected {
			if strings.Contains(process, name) {
				return
			}
		}
		issues = append(issues, fmt.Sprintf(
			"port %d (%s) is held by %q pid=%s (expected %v)",
			listener.Port,
			label,
			listener.Process,
			listener.PID,
			expected,
		))
	}

	checkPort("backend", ports.Backend, []string{"node"})
	checkPort("documenter", ports.Documenter, []string{"node"})
	checkPort("chatbot", ports.Chatbot, []string{"chatbot"})
	checkPort("telemetry", ports.Telemetry, []string{"telemetry", "node"})

	if !probes.BackendCatalog.OK {
		msg := "backend catalog probe failed"
		if probes.BackendCatalog.Error != nil {
			msg = fmt.Sprintf("%s: %s", msg, *probes.BackendCatalog.Error)
		} else if probes.BackendCatalog.Status > 0 {
			msg = fmt.Sprintf("%s: HTTP %d", msg, probes.BackendCatalog.Status)
		}
		issues = append(issues, msg)
	}

	if !probes.DocumenterHealth.OK {
		msg := "documenter health probe failed"
		if probes.DocumenterHealth.Error != nil {
			msg = fmt.Sprintf("%s: %s", msg, *probes.DocumenterHealth.Error)
		} else if probes.DocumenterHealth.Status > 0 {
			msg = fmt.Sprintf("%s: HTTP %d", msg, probes.DocumenterHealth.Status)
		}
		issues = append(issues, msg)
	}

	if !probes.ChatbotHealth.OK {
		msg := "chatbot health probe failed"
		if probes.ChatbotHealth.Error != nil {
			msg = fmt.Sprintf("%s: %s", msg, *probes.ChatbotHealth.Error)
		} else if probes.ChatbotHealth.Status > 0 {
			msg = fmt.Sprintf("%s: HTTP %d", msg, probes.ChatbotHealth.Status)
		}
		issues = append(issues, msg)
	}

	return issues
}
