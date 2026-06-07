package handler

import (
	"net/http"

	"github.com/eduardoos/s3/internal/auth"
	"github.com/eduardoos/s3/internal/config"
	"github.com/eduardoos/s3/internal/storage"
)

func Register(mux *http.ServeMux, cfg config.Config, store *storage.Client) {
	api := &API{Store: store, MaxUploadBytes: cfg.MaxUploadBytes}

	mux.HandleFunc("GET /health", Health)

	registerProtected := func(pattern string, handler http.HandlerFunc) {
		mux.Handle(pattern, auth.Middleware(cfg, handler))
	}

	registerProtected("GET /list", api.List)
	registerProtected("GET /object", api.Object)
	registerProtected("GET /url", api.URL)
	registerProtected("POST /upload", api.Upload)
}
