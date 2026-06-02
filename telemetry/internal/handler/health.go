package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/eduardoos/telemetry/internal/collect"
	"github.com/eduardoos/telemetry/internal/config"
)

type healthResponse struct {
	OK         bool                 `json:"ok"`
	Timestamp  string               `json:"timestamp"`
	Backend    collect.ServiceLogs  `json:"backend"`
	Documenter collect.ServiceLogs  `json:"documenter"`
	System     collect.SystemBlock  `json:"system"`
}

func Health(cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		payload := healthResponse{
			OK:        true,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Backend: collect.ServiceLogsFor(
				cfg, cfg.BackendUnit, cfg.DockerBackendContainer,
			),
			Documenter: collect.ServiceLogsFor(
				cfg, cfg.DocumenterUnit, cfg.DockerDocumenterContainer,
			),
			System: collect.SystemStats(cfg),
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(payload)
	}
}
