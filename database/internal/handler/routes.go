package handler

import (
	"net/http"

	"github.com/eduardoos/database/internal/auth"
	"github.com/eduardoos/database/internal/config"
	"github.com/eduardoos/database/internal/db"
)

func Register(mux *http.ServeMux, cfg config.Config, store *db.Store) {
	api := &API{Store: store}

	mux.HandleFunc("GET /health", Health)

	protected := http.NewServeMux()
	protected.HandleFunc("GET /catalog", api.Catalog)
	protected.HandleFunc("GET /series", api.ListSeries)
	protected.HandleFunc("GET /posts", api.ListPosts)
	protected.HandleFunc("GET /post", api.GetPost)

	mux.Handle("/", auth.Middleware(cfg, protected))
}
