package collect

import (
	"os/exec"
	"strings"

	"github.com/eduardoos/telemetry/internal/config"
)

type UnitStatus struct {
	Unit    string  `json:"unit"`
	Exists  bool    `json:"exists"`
	Active  bool    `json:"active"`
	Enabled *bool   `json:"enabled,omitempty"`
	State   string  `json:"state"`
	Error   *string `json:"error,omitempty"`
}

type ServicesBlock struct {
	Backend    UnitStatus `json:"backend"`
	Documenter UnitStatus `json:"documenter"`
	Chatbot    UnitStatus `json:"chatbot"`
	Telemetry  UnitStatus `json:"telemetry"`
	LegacyAPI  UnitStatus `json:"legacy_api"`
}

func ServicesStatus(cfg config.Config) ServicesBlock {
	if cfg.LogMode == "docker" {
		return ServicesBlock{
			Backend:    dockerContainerStatus(cfg.DockerBackendContainer),
			Documenter: dockerContainerStatus(cfg.DockerDocumenterContainer),
			Chatbot:    dockerContainerStatus(cfg.DockerChatbotContainer),
			Telemetry:  dockerContainerStatus("eduardoos-telemetry"),
			LegacyAPI:  UnitStatus{Unit: cfg.LegacyAPIUnit, Exists: false, State: "n/a"},
		}
	}

	return ServicesBlock{
		Backend:    systemdUnitStatus(cfg.BackendUnit),
		Documenter: systemdUnitStatus(cfg.DocumenterUnit),
		Chatbot:    systemdUnitStatus(cfg.ChatbotUnit),
		Telemetry:  systemdUnitStatus(cfg.TelemetryUnit),
		LegacyAPI:  systemdUnitStatus(cfg.LegacyAPIUnit),
	}
}

func systemdUnitStatus(unit string) UnitStatus {
	status := UnitStatus{Unit: unit}

	if err := exec.Command("systemctl", "cat", unit).Run(); err != nil {
		status.Exists = false
		status.State = "missing"
		return status
	}
	status.Exists = true

	if out, err := exec.Command("systemctl", "is-active", unit).Output(); err == nil {
		active := strings.TrimSpace(string(out)) == "active"
		status.Active = active
		status.State = strings.TrimSpace(string(out))
	} else {
		status.State = "inactive"
	}

	if out, err := exec.Command("systemctl", "is-enabled", unit).Output(); err == nil {
		enabled := strings.TrimSpace(string(out)) == "enabled"
		status.Enabled = &enabled
	}

	return status
}

func dockerContainerStatus(name string) UnitStatus {
	status := UnitStatus{Unit: name, Exists: true}

	out, err := exec.Command(
		"docker", "inspect", "-f", "{{.State.Running}}", name,
	).Output()
	if err != nil {
		msg := strings.TrimSpace(err.Error())
		status.Exists = false
		status.State = "missing"
		status.Error = &msg
		return status
	}

	running := strings.TrimSpace(string(out)) == "true"
	status.Active = running
	if running {
		status.State = "running"
	} else {
		status.State = "stopped"
	}

	return status
}
