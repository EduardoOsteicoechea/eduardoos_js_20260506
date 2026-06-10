package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/eduardoos/database/internal/authdata"
	"github.com/eduardoos/database/internal/config"
	"github.com/eduardoos/database/internal/db"
	"github.com/eduardoos/database/internal/dynamo"
	"github.com/eduardoos/database/internal/handler"
	"github.com/eduardoos/database/internal/logship"
)

func main() {
	cfg := config.Load()

	var store db.DataStore
	var err error
	switch strings.ToLower(cfg.DataStore) {
	case "sqlite":
		store, err = db.Open(cfg.DBPath)
		if err != nil {
			log.Fatalf("open sqlite: %v", err)
		}
		log.Printf("posts-db listening on %s (sqlite=%s)", cfg.Addr(), cfg.DBPath)
	default:
		store, err = dynamo.Open(cfg)
		if err != nil {
			log.Fatalf("open dynamodb: %v", err)
		}
		log.Printf("posts-db listening on %s (dynamodb catalog=%s posts=%s region=%s)",
			cfg.Addr(), cfg.DynamoCatalogTable, cfg.DynamoPostsTable, cfg.AWSRegion)
	}
	defer store.Close()

	logship.Install(logship.Config{
		Service: "database",
		Store:   store,
	})

	mux := http.NewServeMux()
	handler.Register(mux, cfg, store)
	if authStore, ok := store.(authdata.Store); ok {
		handler.RegisterAuth(mux, cfg, authStore)
	}

	if err := http.ListenAndServe(cfg.Addr(), mux); err != nil {
		log.Fatal(err)
	}
}
