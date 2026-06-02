package handler

import (
	"net/http"

	"github.com/eduardoos/telemetry/internal/config"
)

// RegisterHealth mounts /api/server/health with or without a trailing slash.
func RegisterHealth(mux *http.ServeMux, cfg config.Config) {
	handler := Health(cfg)
	mux.HandleFunc("/api/server/health", handler)
	mux.HandleFunc("/api/server/health/", handler)
}
