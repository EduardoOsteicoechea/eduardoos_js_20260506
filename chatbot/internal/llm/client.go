package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/eduardoos/chatbot/internal/config"
)

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

type openAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func BuildStubReply(pageType, userText string) string {
	snippet := userText
	if len(snippet) > 120 {
		snippet = snippet[:120] + "…"
	}
	return fmt.Sprintf(
		"Recibí tu mensaje (%q). Configura LLM_API_KEY (DeepSeek) en chatbot/.env para respuestas reales. Contexto de página: %s.",
		snippet,
		pageType,
	)
}

func Complete(cfg config.Config, systemPrompt, userMessage string) (string, error) {
	if cfg.LLMAPIURL == "" || cfg.LLMAPIKey == "" {
		return "", fmt.Errorf("llm not configured")
	}

	payload := openAIRequest{
		Model: cfg.LLMModel,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userMessage},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodPost, cfg.LLMAPIURL, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.LLMAPIKey)

	client := &http.Client{Timeout: 90 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("llm HTTP %d: %s", res.StatusCode, strings.TrimSpace(string(raw)))
	}

	var parsed openAIResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return "", err
	}
	if parsed.Error != nil && parsed.Error.Message != "" {
		return "", fmt.Errorf(parsed.Error.Message)
	}
	if len(parsed.Choices) == 0 || strings.TrimSpace(parsed.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("llm returned empty content")
	}

	return strings.TrimSpace(parsed.Choices[0].Message.Content), nil
}
