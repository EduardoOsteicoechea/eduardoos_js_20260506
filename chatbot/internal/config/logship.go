package config

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type appendLogInput struct {
	Service string         `json:"service"`
	Level   string         `json:"level"`
	Message string         `json:"message"`
	Context map[string]any `json:"context,omitempty"`
}

type logShipWriter struct {
	service string
	url     string
	token   string
	stderr  io.Writer
	queue   chan appendLogInput
	once    sync.Once
}

func InstallLogShip(cfg Config) {
	service := "chatbot"
	url := strings.TrimRight(strings.TrimSpace(cfg.PostsDBURL), "/")
	token := strings.TrimSpace(cfg.PostsDBInternalToken)
	if service == "" || url == "" || token == "" {
		return
	}

	writer := &logShipWriter{
		service: service,
		url:     url,
		token:   token,
		stderr:  os.Stderr,
		queue:   make(chan appendLogInput, 256),
	}
	writer.once.Do(writer.runWorker)
	log.SetOutput(io.MultiWriter(writer.stderr, writer))
	log.SetFlags(log.LstdFlags)
}

func (w *logShipWriter) Write(p []byte) (int, error) {
	message := strings.TrimSpace(string(p))
	if message != "" {
		w.enqueue(appendLogInput{
			Service: w.service,
			Level:   "info",
			Message: message,
		})
	}
	return len(p), nil
}

func (w *logShipWriter) enqueue(input appendLogInput) {
	select {
	case w.queue <- input:
	default:
	}
}

func (w *logShipWriter) runWorker() {
	go func() {
		for input := range w.queue {
			w.persist(input)
		}
	}()
}

func (w *logShipWriter) persist(input appendLogInput) {
	payload, err := json.Marshal(input)
	if err != nil {
		return
	}

	req, err := http.NewRequest(http.MethodPost, w.url+"/logs", bytes.NewReader(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Posts-Db-Internal-Token", w.token)

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	_ = resp.Body.Close()
}
