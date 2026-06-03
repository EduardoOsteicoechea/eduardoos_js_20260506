package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/eduardoos/chatbot/internal/config"
	"github.com/eduardoos/chatbot/internal/llm"
)

type historyItem struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Message       string          `json:"message"`
	PageContext   json.RawMessage `json:"pageContext"`
	GlobalContext json.RawMessage `json:"globalContext"`
	History       []historyItem   `json:"history"`
}

type chatResponse struct {
	OK    bool   `json:"ok"`
	Reply string `json:"reply"`
	Stub  bool   `json:"stub,omitempty"`
}

func pageTypeFromContext(raw json.RawMessage) string {
	if len(raw) == 0 {
		return "generic"
	}
	var parsed struct {
		PageType string `json:"pageType"`
	}
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return "generic"
	}
	if parsed.PageType == "" {
		return "generic"
	}
	return parsed.PageType
}

func buildSystemPrompt(pageContext, globalContext json.RawMessage) string {
	var parts []string
	parts = append(parts, "You are Eduardo Osteicoechea's site assistant. Answer concisely in the user's language.")
	if len(pageContext) > 0 {
		parts = append(parts, "Page context JSON:\n"+string(pageContext))
	}
	if len(globalContext) > 0 {
		parts = append(parts, "Global context JSON:\n"+string(globalContext))
	}
	return strings.Join(parts, "\n\n")
}

func Chat(cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
		if err != nil {
			writeChatError(w, http.StatusBadRequest, "invalid body")
			return
		}

		var req chatRequest
		if err := json.Unmarshal(body, &req); err != nil {
			writeChatError(w, http.StatusBadRequest, "invalid JSON")
			return
		}

		message := strings.TrimSpace(req.Message)
		if message == "" {
			writeChatError(w, http.StatusBadRequest, "message is required")
			return
		}

		pageType := pageTypeFromContext(req.PageContext)
		systemPrompt := buildSystemPrompt(req.PageContext, req.GlobalContext)

		var userPrompt strings.Builder
		for _, item := range req.History {
			role := strings.TrimSpace(item.Role)
			content := strings.TrimSpace(item.Content)
			if role == "" || content == "" {
				continue
			}
			userPrompt.WriteString(fmt.Sprintf("[%s] %s\n", role, content))
		}
		userPrompt.WriteString(fmt.Sprintf("[user] %s", message))

		reply, llmErr := llm.Complete(cfg, systemPrompt, userPrompt.String())
		stub := false
		if llmErr != nil {
			reply = llm.BuildStubReply(pageType, message)
			stub = true
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(chatResponse{
			OK:    true,
			Reply: reply,
			Stub:  stub,
		})
	}
}

func writeChatError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":    false,
		"error": msg,
	})
}
