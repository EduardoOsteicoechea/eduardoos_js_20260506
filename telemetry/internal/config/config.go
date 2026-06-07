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
	ChatbotUnit               string
	PostsDbUnit               string
	S3Unit                    string
	LegacyAPIUnit             string
	DockerBackendContainer    string
	DockerDocumenterContainer string
	DockerChatbotContainer    string
	DockerS3Container         string
	HostProcRoot              string
	DiskPath                  string
	BackendDistPath           string
	DocumenterDistPath        string
	BackendHealthURL          string
	DocumenterHealthURL       string
	ChatbotHealthURL          string
	PostsDbHealthURL          string
	S3HealthURL               string
	BackendPort               int
	DocumenterPort            int
	TelemetryPort             int
	ChatbotPort               int
	PostsDbPort               int
	S3Port                    int
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
	chatbotPort := envInt("CHATBOT_PORT", 8110)
	postsDbPort := envInt("POSTS_DB_PORT", 8120)
	s3Port := envInt("S3_PORT", 8130)

	return Config{
		Port:                      envOr("PORT", "8100"),
		LogMode:                   logMode,
		LogLines:                  lines,
		BackendUnit:               envOr("BACKEND_UNIT", "eduardoos-backend"),
		DocumenterUnit:            envOr("DOCUMENTER_UNIT", "eduardoos-documenter"),
		TelemetryUnit:             envOr("TELEMETRY_UNIT", "eduardoos-telemetry"),
		ChatbotUnit:               envOr("CHATBOT_UNIT", "eduardoos-chatbot"),
		PostsDbUnit:               envOr("POSTS_DB_UNIT", "eduardoos-database"),
		S3Unit:                    envOr("S3_UNIT", "eduardoos-s3"),
		LegacyAPIUnit:             envOr("LEGACY_API_UNIT", "eduardoos-api"),
		DockerBackendContainer:    envOr("DOCKER_BACKEND_CONTAINER", "eduardoos-backend"),
		DockerDocumenterContainer: envOr("DOCKER_DOCUMENTER_CONTAINER", "eduardoos-documenter"),
		DockerChatbotContainer:    envOr("DOCKER_CHATBOT_CONTAINER", "eduardoos-chatbot"),
		DockerS3Container:         envOr("DOCKER_S3_CONTAINER", "eduardoos-s3api"),
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
		ChatbotHealthURL: envOr(
			"CHATBOT_HEALTH_URL",
			"http://127.0.0.1:8110/health",
		),
		PostsDbHealthURL: envOr(
			"POSTS_DB_HEALTH_URL",
			"http://127.0.0.1:8120/health",
		),
		S3HealthURL: envOr(
			"S3_HEALTH_URL",
			"http://127.0.0.1:8130/health",
		),
		BackendPort:    backendPort,
		DocumenterPort: documenterPort,
		TelemetryPort:  telemetryPort,
		ChatbotPort:    chatbotPort,
		PostsDbPort:    postsDbPort,
		S3Port:         s3Port,
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
