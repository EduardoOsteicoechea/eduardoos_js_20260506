package logship

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

type Config struct {
	Service string
	URL     string
	Token   string
}

type appendInput struct {
	Service string         `json:"service"`
	Level   string         `json:"level"`
	Message string         `json:"message"`
	Context map[string]any `json:"context,omitempty"`
}

type shipWriter struct {
	service string
	url     string
	token   string
	stderr  io.Writer
	queue   chan appendInput
	once    sync.Once
}

func Install(cfg Config) {
	service := strings.ToLower(strings.TrimSpace(cfg.Service))
	url := strings.TrimRight(strings.TrimSpace(cfg.URL), "/")
	token := strings.TrimSpace(cfg.Token)
	if service == "" || url == "" || token == "" {
		return
	}

	writer := &shipWriter{
		service: service,
		url:     url,
		token:   token,
		stderr:  os.Stderr,
		queue:   make(chan appendInput, 256),
	}
	writer.once.Do(writer.runWorker)
	log.SetOutput(io.MultiWriter(writer.stderr, writer))
	log.SetFlags(log.LstdFlags)
}

func (w *shipWriter) Write(p []byte) (int, error) {
	message := strings.TrimSpace(string(p))
	if message != "" {
		w.enqueue(appendInput{
			Service: w.service,
			Level:   "info",
			Message: message,
		})
	}
	return len(p), nil
}

func (w *shipWriter) enqueue(input appendInput) {
	select {
	case w.queue <- input:
	default:
	}
}

func (w *shipWriter) runWorker() {
	go func() {
		for input := range w.queue {
			w.persist(input)
		}
	}()
}

func (w *shipWriter) persist(input appendInput) {
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
