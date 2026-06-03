package main

import (
	"log"
	"net/http"

	"github.com/eduardoos/chatbot/internal/auth"
	"github.com/eduardoos/chatbot/internal/config"
	"github.com/eduardoos/chatbot/internal/handler"
)

func main() {
	cfg := config.Load()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.Health(cfg))

	protected := http.NewServeMux()
	protected.HandleFunc("/chat", handler.Chat(cfg))
	mux.Handle("/chat", auth.Middleware(cfg, protected))

	addr := cfg.Addr()
	log.Printf(
		"chatbot listening on %s (public_auth=%v llm_configured=%v)",
		addr,
		cfg.PublicAuthEnabled,
		cfg.LLMAPIURL != "" && cfg.LLMAPIKey != "",
	)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
