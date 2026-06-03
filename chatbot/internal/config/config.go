package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                   string
	BindHost               string
	InternalToken          string
	PublicAuthEnabled      bool
	LLMAPIURL              string
	LLMAPIKey              string
	LLMModel               string
}

func Load() Config {
	return Config{
		Port:              envOr("PORT", "8110"),
		BindHost:          envOr("BIND_HOST", "127.0.0.1"),
		InternalToken:     strings.TrimSpace(os.Getenv("CHATBOT_INTERNAL_TOKEN")),
		PublicAuthEnabled: envBool("CHATBOT_PUBLIC_AUTH_ENABLED", false),
		LLMAPIURL:         envOr("LLM_API_URL", "https://api.deepseek.com/chat/completions"),
		LLMAPIKey:         strings.TrimSpace(os.Getenv("LLM_API_KEY")),
		LLMModel:          envOr("LLM_MODEL", "deepseek-chat"),
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

func envBool(key string, fallback bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return parsed
}
