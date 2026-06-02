package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                      string
	LogMode                   string
	LogLines                  int
	BackendUnit               string
	DocumenterUnit            string
	TelemetryUnit             string
	LegacyAPIUnit             string
	DockerBackendContainer    string
	DockerDocumenterContainer string
	HostProcRoot              string
	DiskPath                  string
	BackendDistPath           string
	DocumenterDistPath        string
	BackendHealthURL          string
	DocumenterHealthURL       string
	BackendPort               int
	DocumenterPort            int
	TelemetryPort             int
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

	backendPort := envInt("BACKEND_PORT", 8080)
	documenterPort := envInt("DOCUMENTER_PORT", 8090)
	telemetryPort := envInt("TELEMETRY_PORT", 8100)

	return Config{
		Port:                      envOr("PORT", "8100"),
		LogMode:                   logMode,
		LogLines:                  lines,
		BackendUnit:               envOr("BACKEND_UNIT", "eduardoos-backend"),
		DocumenterUnit:            envOr("DOCUMENTER_UNIT", "eduardoos-documenter"),
		TelemetryUnit:             envOr("TELEMETRY_UNIT", "eduardoos-telemetry"),
		LegacyAPIUnit:             envOr("LEGACY_API_UNIT", "eduardoos-api"),
		DockerBackendContainer:    envOr("DOCKER_BACKEND_CONTAINER", "eduardoos-backend"),
		DockerDocumenterContainer: envOr("DOCKER_DOCUMENTER_CONTAINER", "eduardoos-documenter"),
		HostProcRoot:              strings.TrimSuffix(envOr("HOST_PROC", "/proc"), "/"),
		DiskPath:                  envOr("DISK_PATH", "/"),
		BackendDistPath: envOr(
			"BACKEND_DIST_PATH",
			"/home/ec2-user/backend/dist/server.js",
		),
		DocumenterDistPath: envOr(
			"DOCUMENTER_DIST_PATH",
			"/home/ec2-user/documenter/dist/server.js",
		),
		BackendHealthURL: envOr(
			"BACKEND_HEALTH_URL",
			"http://127.0.0.1:8080/api/series/catalog",
		),
		DocumenterHealthURL: envOr(
			"DOCUMENTER_HEALTH_URL",
			"http://127.0.0.1:8090/health",
		),
		BackendPort:    backendPort,
		DocumenterPort: documenterPort,
		TelemetryPort:  telemetryPort,
	}
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
