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

	"github.com/eduardoos/database/internal/db"
)

type directAppender interface {
	AppendLog(input db.AppendLogInput) (int64, error)
}

type Config struct {
	Service string
	Store   directAppender
	URL     string
	Token   string
}

type shipWriter struct {
	service string
	store   directAppender
	url     string
	token   string
	stderr  io.Writer
	queue   chan db.AppendLogInput
	once    sync.Once
}

func Install(cfg Config) {
	service := strings.ToLower(strings.TrimSpace(cfg.Service))
	if service == "" {
		return
	}

	writer := &shipWriter{
		service: service,
		store:   cfg.Store,
		url:     strings.TrimRight(strings.TrimSpace(cfg.URL), "/"),
		token:   strings.TrimSpace(cfg.Token),
		stderr:  os.Stderr,
		queue:   make(chan db.AppendLogInput, 256),
	}
	writer.once.Do(writer.runWorker)
	log.SetOutput(io.MultiWriter(writer.stderr, writer))
	log.SetFlags(log.LstdFlags)
}

func (w *shipWriter) Write(p []byte) (int, error) {
	message := strings.TrimSpace(string(p))
	if message != "" {
		w.enqueue(db.AppendLogInput{
			Service: w.service,
			Level:   db.LogLevelInfo,
			Message: message,
		})
	}
	return len(p), nil
}

func (w *shipWriter) enqueue(input db.AppendLogInput) {
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

func (w *shipWriter) persist(input db.AppendLogInput) {
	if w.store != nil {
		if _, err := w.store.AppendLog(input); err != nil {
			_, _ = io.WriteString(w.stderr, "logship store: "+err.Error()+"\n")
		}
		return
	}

	if w.url == "" || w.token == "" {
		return
	}

	payload, err := json.Marshal(map[string]any{
		"service": input.Service,
		"level":   input.Level,
		"message": input.Message,
		"context": input.Context,
	})
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

func Ship(service, level, message string, context map[string]any) {
	// no-op helper for explicit shipping from other packages if needed
	_ = service
	_ = level
	_ = message
	_ = context
}
