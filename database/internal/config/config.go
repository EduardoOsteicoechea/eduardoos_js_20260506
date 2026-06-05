package config

import (
	"os"
	"strings"
)

type Config struct {
	Port          string
	BindHost      string
	DBPath        string
	InternalToken string
}

func Load() Config {
	return Config{
		Port:          envOr("PORT", "8120"),
		BindHost:      envOr("BIND_HOST", "127.0.0.1"),
		DBPath:        envOr("DB_PATH", "posts.db"),
		InternalToken: strings.TrimSpace(os.Getenv("POSTS_DB_INTERNAL_TOKEN")),
	}
}

func (c Config) Addr() string {
	return c.BindHost + ":" + c.Port
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
