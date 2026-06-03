package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port              string
	BindHost          string
	InternalToken     string
	PublicAuthEnabled bool
	LLMAPIURL         string
	LLMAPIKey         string
	LLMModel          string
	GuidelinesPath    string
	KnowledgeDir      string
	KnowledgeMaxChars int
}

func Load() Config {
	maxKnowledge := 28000
	if v := strings.TrimSpace(os.Getenv("KNOWLEDGE_MAX_CHARS")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxKnowledge = n
		}
	}

	return Config{
		Port:              envOr("PORT", "8110"),
		BindHost:          envOr("BIND_HOST", "127.0.0.1"),
		InternalToken:     strings.TrimSpace(os.Getenv("CHATBOT_INTERNAL_TOKEN")),
		PublicAuthEnabled: envBool("CHATBOT_PUBLIC_AUTH_ENABLED", false),
		LLMAPIURL:         envOr("LLM_API_URL", "https://api.deepseek.com/chat/completions"),
		LLMAPIKey:         strings.TrimSpace(os.Getenv("LLM_API_KEY")),
		LLMModel:          envOr("LLM_MODEL", "deepseek-chat"),
		GuidelinesPath:    envOr("GUIDELINES_PATH", "guidelines/RESPONSE_GUIDELINES.md"),
		KnowledgeDir:      envOr("KNOWLEDGE_DIR", "guidelines/knowledge"),
		KnowledgeMaxChars: maxKnowledge,
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
