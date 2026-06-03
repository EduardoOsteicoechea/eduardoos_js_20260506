package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/eduardoos/chatbot/internal/config"
)

type healthPayload struct {
	OK                 bool   `json:"ok"`
	Service            string `json:"service"`
	Timestamp          string `json:"timestamp"`
	LLMProvider        string `json:"llm_provider"`
	LLMModel           string `json:"llm_model"`
	LLMConfigured      bool   `json:"llm_configured"`
	PublicAuthEnabled  bool   `json:"public_auth_enabled"`
	InternalAuthActive bool   `json:"internal_auth_active"`
}

func Health(cfg config.Config) http.HandlerFunc {
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
			LLMProvider:        "deepseek",
			LLMModel:           cfg.LLMModel,
			LLMConfigured:      cfg.LLMAPIURL != "" && cfg.LLMAPIKey != "",
			PublicAuthEnabled:  cfg.PublicAuthEnabled,
			InternalAuthActive: cfg.InternalToken != "",
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(payload)
	}
}
