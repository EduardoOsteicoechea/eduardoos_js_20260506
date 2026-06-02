package main

import (
	"log"
	"net/http"

	"github.com/eduardoos/telemetry/internal/config"
	"github.com/eduardoos/telemetry/internal/handler"
)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()
	mux.HandleFunc("/api/server/healt", handler.Health(cfg))

	addr := ":" + cfg.Port
	log.Printf("telemetry listening on %s (log_mode=%s)", addr, cfg.LogMode)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
