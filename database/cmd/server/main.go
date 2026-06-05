package main

import (
	"log"
	"net/http"

	"github.com/eduardoos/database/internal/config"
	"github.com/eduardoos/database/internal/db"
	"github.com/eduardoos/database/internal/handler"
)

func main() {
	cfg := config.Load()

	store, err := db.Open(cfg.DBPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer store.Close()

	mux := http.NewServeMux()
	handler.Register(mux, cfg, store)

	addr := cfg.Addr()
	log.Printf("posts-db listening on %s (db=%s)", addr, cfg.DBPath)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
