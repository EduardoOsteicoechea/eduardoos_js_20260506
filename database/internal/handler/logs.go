package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/eduardoos/database/internal/db"
)

func (a *API) AppendLogs(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 4<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var raw any
	if err := json.Unmarshal(body, &raw); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	inputs, err := parseAppendLogPayload(raw)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if len(inputs) == 0 {
		writeError(w, http.StatusBadRequest, "at least one log entry is required")
		return
	}

	inserted, err := a.Store.AppendLogs(inputs)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"inserted": inserted,
	})
}

func (a *API) QueryLogs(w http.ResponseWriter, r *http.Request) {
	limit := 200
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed <= 0 {
			writeError(w, http.StatusBadRequest, "invalid limit")
			return
		}
		limit = parsed
	}

	var sinceID int64
	if raw := strings.TrimSpace(r.URL.Query().Get("since_id")); raw != "" {
		parsed, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || parsed < 0 {
			writeError(w, http.StatusBadRequest, "invalid since_id")
			return
		}
		sinceID = parsed
	}

	logs, err := a.Store.ListLogs(db.ListLogsQuery{
		Service: strings.TrimSpace(r.URL.Query().Get("service")),
		Level:   strings.TrimSpace(r.URL.Query().Get("level")),
		Limit:   limit,
		SinceID: sinceID,
	})
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	total, err := a.Store.CountLogs()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not count logs")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"total": total,
		"logs":  logs,
	})
}

func parseAppendLogPayload(raw any) ([]db.AppendLogInput, error) {
	switch typed := raw.(type) {
	case map[string]any:
		item, err := parseAppendLogEntry(typed)
		if err != nil {
			return nil, err
		}
		return []db.AppendLogInput{item}, nil
	case []any:
		out := make([]db.AppendLogInput, 0, len(typed))
		for _, entry := range typed {
			record, ok := entry.(map[string]any)
			if !ok {
				return nil, errInvalidLogPayload()
			}
			item, err := parseAppendLogEntry(record)
			if err != nil {
				return nil, err
			}
			out = append(out, item)
		}
		return out, nil
	default:
		return nil, errInvalidLogPayload()
	}
}

func parseAppendLogEntry(raw map[string]any) (db.AppendLogInput, error) {
	service := strings.TrimSpace(fmtAny(raw["service"]))
	message := strings.TrimSpace(fmtAny(raw["message"]))
	if service == "" || message == "" {
		return db.AppendLogInput{}, errInvalidLogPayload()
	}

	var context map[string]any
	if value, ok := raw["context"].(map[string]any); ok && value != nil {
		context = value
	}

	return db.AppendLogInput{
		Service:   service,
		Level:     strings.TrimSpace(fmtAny(raw["level"])),
		Message:   message,
		Context:   context,
		CreatedAt: strings.TrimSpace(fmtAny(raw["created_at"])),
	}, nil
}

func errInvalidLogPayload() error {
	return &logPayloadError{}
}

type logPayloadError struct{}

func (e *logPayloadError) Error() string {
	return "invalid log payload"
}
