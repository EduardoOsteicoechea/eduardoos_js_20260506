package main

import (
	"context"
	"log"
	"net/http"

	"github.com/eduardoos/s3/internal/config"
	"github.com/eduardoos/s3/internal/handler"
	"github.com/eduardoos/s3/internal/storage"
)

func main() {
	cfg := config.Load()

	store, err := storage.New(context.Background(), cfg)
	if err != nil {
		log.Fatalf("open s3 client: %v", err)
	}

	mux := http.NewServeMux()
	handler.Register(mux, cfg, store)

	addr := cfg.Addr()
	log.Printf("s3-api listening on %s (bucket=%s)", addr, cfg.Bucket)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
