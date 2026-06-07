package main

import (
	"log"
	"net/http"

	"github.com/eduardoos/chatbot/internal/auth"
	"github.com/eduardoos/chatbot/internal/config"
	"github.com/eduardoos/chatbot/internal/guidelines"
	"github.com/eduardoos/chatbot/internal/handler"
	"github.com/eduardoos/chatbot/internal/logship"
)

func main() {
	cfg := config.Load()
	logship.Install(logship.Config{
		Service: "chatbot",
		URL:     cfg.PostsDBURL,
		Token:   cfg.PostsDBInternalToken,
	})
	guide := guidelines.Load(cfg)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.Health(cfg, guide))

	protected := http.NewServeMux()
	protected.HandleFunc("/chat", handler.Chat(cfg, guide))
	mux.Handle("/chat", auth.Middleware(cfg, protected))

	addr := cfg.Addr()
	log.Printf(
		"chatbot listening on %s (public_auth=%v llm_configured=%v guidelines=%v knowledge_files=%d)",
		addr,
		cfg.PublicAuthEnabled,
		cfg.LLMAPIURL != "" && cfg.LLMAPIKey != "",
		guide.GuidelinesText != "",
		len(guide.KnowledgeFiles),
	)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
