package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                     string
	LogMode                  string
	LogLines                 int
	BackendUnit              string
	DocumenterUnit           string
	DockerBackendContainer   string
	DockerDocumenterContainer string
	HostProcRoot             string
	DiskPath                 string
}

func Load() Config {
	lines := 80
	if v := os.Getenv("LOG_LINES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			lines = n
		}
	}

	logMode := strings.ToLower(strings.TrimSpace(envOr("LOG_MODE", "systemd")))
	if logMode != "docker" {
		logMode = "systemd"
	}

	return Config{
		Port:                      envOr("PORT", "8100"),
		LogMode:                   logMode,
		LogLines:                  lines,
		BackendUnit:               envOr("BACKEND_UNIT", "eduardoos-backend"),
		DocumenterUnit:            envOr("DOCUMENTER_UNIT", "eduardoos-documenter"),
		DockerBackendContainer:    envOr("DOCKER_BACKEND_CONTAINER", "eduardoos-backend"),
		DockerDocumenterContainer: envOr("DOCKER_DOCUMENTER_CONTAINER", "eduardoos-documenter"),
		HostProcRoot:              strings.TrimSuffix(envOr("HOST_PROC", "/proc"), "/"),
		DiskPath:                  envOr("DISK_PATH", "/"),
	}
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
