package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"strings"

	"github.com/eduardoos/chatbot/internal/config"
	"github.com/eduardoos/chatbot/internal/guidelines"
)

type healthPayload struct {
	OK                 bool     `json:"ok"`
	Service            string   `json:"service"`
	Timestamp          string   `json:"timestamp"`
	LLMProvider        string   `json:"llm_provider"`
	LLMModel           string   `json:"llm_model"`
	LLMConfigured      bool     `json:"llm_configured"`
	PublicAuthEnabled  bool     `json:"public_auth_enabled"`
	InternalAuthActive bool     `json:"internal_auth_active"`
	GuidelinesLoaded   bool     `json:"guidelines_loaded"`
	GuidelinesPath     string   `json:"guidelines_path"`
	KnowledgeDir       string   `json:"knowledge_dir"`
	KnowledgeFiles     []string `json:"knowledge_files"`
	KnowledgeTruncated bool     `json:"knowledge_truncated"`
}

func Health(cfg config.Config, guide guidelines.Bundle) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		payload := healthPayload{
			OK:                 true,
			Service:            "chatbot",
			Timestamp:          time.Now().UTC().Format(time.RFC3339),
			LLMProvider:        llmProviderFromURL(cfg.LLMAPIURL),
			LLMModel:           cfg.LLMModel,
			LLMConfigured:      cfg.LLMAPIURL != "" && cfg.LLMAPIKey != "",
			PublicAuthEnabled:  cfg.PublicAuthEnabled,
			InternalAuthActive: cfg.InternalToken != "",
			GuidelinesLoaded:   guide.GuidelinesText != "",
			GuidelinesPath:     guide.GuidelinesPath,
			KnowledgeDir:       guide.KnowledgeDir,
			KnowledgeFiles:     guide.KnowledgeFiles,
			KnowledgeTruncated: guide.KnowledgeTruncated,
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func llmProviderFromURL(apiURL string) string {
	lower := strings.ToLower(apiURL)
	switch {
	case strings.Contains(lower, "deepseek"):
		return "deepseek"
	case strings.Contains(lower, "openai"):
		return "openai"
	case apiURL == "":
		return "unknown"
	default:
		return "custom"
	}
}
