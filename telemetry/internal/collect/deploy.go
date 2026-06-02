package collect

import (
	"os"

	"github.com/eduardoos/telemetry/internal/config"
)

type ArtifactCheck struct {
	Path   string `json:"path"`
	Exists bool   `json:"exists"`
}

type DeployBlock struct {
	BackendDist    ArtifactCheck `json:"backend_dist"`
	DocumenterDist ArtifactCheck `json:"documenter_dist"`
}

func DeployStatus(cfg config.Config) DeployBlock {
	return DeployBlock{
		BackendDist:    checkFile(cfg.BackendDistPath),
		DocumenterDist: checkFile(cfg.DocumenterDistPath),
	}
}

func checkFile(path string) ArtifactCheck {
	_, err := os.Stat(path)
	return ArtifactCheck{
		Path:   path,
		Exists: err == nil,
	}
}
