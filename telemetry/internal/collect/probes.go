package collect

import (
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/eduardoos/telemetry/internal/config"
)

type HTTPProbe struct {
	URL       string  `json:"url"`
	OK        bool    `json:"ok"`
	Status    int     `json:"status,omitempty"`
	LatencyMs int64   `json:"latency_ms,omitempty"`
	Snippet   string  `json:"snippet,omitempty"`
	Error     *string `json:"error,omitempty"`
}

type ProbesBlock struct {
	BackendCatalog   HTTPProbe `json:"backend_catalog"`
	DocumenterHealth HTTPProbe `json:"documenter_health"`
	ChatbotHealth    HTTPProbe `json:"chatbot_health"`
	PostsDbHealth    HTTPProbe `json:"posts_db_health"`
	S3Health         HTTPProbe `json:"s3_health"`
}

func Probes(cfg config.Config) ProbesBlock {
	return ProbesBlock{
		BackendCatalog:   httpProbe(cfg.BackendHealthURL),
		DocumenterHealth: httpProbe(cfg.DocumenterHealthURL),
		ChatbotHealth:    httpProbe(cfg.ChatbotHealthURL),
		PostsDbHealth:    httpProbe(cfg.PostsDbHealthURL),
		S3Health:         httpProbe(cfg.S3HealthURL),
	}
}

func httpProbe(url string) HTTPProbe {
	probe := HTTPProbe{URL: url}
	client := &http.Client{Timeout: 8 * time.Second}

	start := time.Now()
	response, err := client.Get(url)
	probe.LatencyMs = time.Since(start).Milliseconds()

	if err != nil {
		msg := err.Error()
		probe.Error = &msg
		return probe
	}
	defer response.Body.Close()

	probe.Status = response.StatusCode
	probe.OK = response.StatusCode >= 200 && response.StatusCode < 300

	body, _ := io.ReadAll(io.LimitReader(response.Body, 240))
	probe.Snippet = strings.TrimSpace(string(body))

	return probe
}
