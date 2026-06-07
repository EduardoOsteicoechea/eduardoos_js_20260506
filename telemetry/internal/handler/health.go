package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/eduardoos/telemetry/internal/collect"
	"github.com/eduardoos/telemetry/internal/config"
)

type healthResponse struct {
	OK         bool                   `json:"ok"`
	Timestamp  string                 `json:"timestamp"`
	Issues     []string               `json:"issues"`
	Warnings   []string               `json:"warnings"`
	Services   collect.ServicesBlock  `json:"services"`
	Ports      collect.PortsBlock     `json:"ports"`
	Deploy     collect.DeployBlock    `json:"deploy"`
	Probes     collect.ProbesBlock    `json:"probes"`
	Backend    collect.ServiceLogs    `json:"backend"`
	Documenter collect.ServiceLogs    `json:"documenter"`
	Chatbot    collect.ServiceLogs    `json:"chatbot"`
	PostsDb    collect.ServiceLogs    `json:"posts_db"`
	S3         collect.ServiceLogs    `json:"s3"`
	System     collect.SystemBlock    `json:"system"`
}

func Health(cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		services := collect.ServicesStatus(cfg)
		ports := collect.PortsStatusWithFallback(cfg)
		deploy := collect.DeployStatus(cfg)
		probes := collect.Probes(cfg)
		issues := collect.EvaluateIssues(cfg, services, ports, deploy, probes)

		backendLogs := collect.ServiceLogsFor(
			cfg, cfg.BackendUnit, cfg.DockerBackendContainer,
		)
		documenterLogs := collect.ServiceLogsFor(
			cfg, cfg.DocumenterUnit, cfg.DockerDocumenterContainer,
		)
		chatbotLogs := collect.ServiceLogsFor(
			cfg, cfg.ChatbotUnit, cfg.DockerChatbotContainer,
		)
		postsDbLogs := collect.ServiceLogsFor(cfg, cfg.PostsDbUnit, "")
		s3Logs := collect.ServiceLogsFor(cfg, cfg.S3Unit, cfg.DockerS3Container)

		warnings := []string{}
		warnings = append(warnings, collect.RecentLogWarnings(backendLogs, services.Backend.Active)...)
		warnings = append(warnings, collect.RecentLogWarnings(documenterLogs, services.Documenter.Active)...)
		warnings = append(warnings, collect.RecentLogWarnings(chatbotLogs, services.Chatbot.Active)...)
		warnings = append(warnings, collect.RecentLogWarnings(postsDbLogs, services.PostsDb.Active)...)
		warnings = append(warnings, collect.RecentLogWarnings(s3Logs, services.S3.Active)...)

		if issues == nil {
			issues = []string{}
		}
		if warnings == nil {
			warnings = []string{}
		}

		payload := healthResponse{
			OK:        len(issues) == 0,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Issues:    issues,
			Warnings:  warnings,
			Services:  services,
			Ports:     ports,
			Deploy:    deploy,
			Probes:    probes,
			Backend:    backendLogs,
			Documenter: documenterLogs,
			Chatbot:    chatbotLogs,
			PostsDb:    postsDbLogs,
			S3:         s3Logs,
			System: collect.SystemStats(cfg),
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(payload)
	}
}
