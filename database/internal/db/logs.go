package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

const (
	LogLevelDebug = "debug"
	LogLevelInfo  = "info"
	LogLevelWarn  = "warn"
	LogLevelError = "error"
)

var allowedLogServices = map[string]bool{
	"backend":    true,
	"chatbot":    true,
	"documenter": true,
	"database":   true,
	"s3":         true,
}

var allowedLogLevels = map[string]bool{
	LogLevelDebug: true,
	LogLevelInfo:  true,
	LogLevelWarn:  true,
	LogLevelError: true,
}

type ServiceLog struct {
	ID        int64          `json:"id"`
	Service   string         `json:"service"`
	Level     string         `json:"level"`
	Message   string         `json:"message"`
	Context   map[string]any `json:"context,omitempty"`
	CreatedAt string         `json:"created_at"`
}

type AppendLogInput struct {
	Service   string
	Level     string
	Message   string
	Context   map[string]any
	CreatedAt string
}

type ListLogsQuery struct {
	Service string
	Level   string
	Limit   int
	SinceID int64
}

func SerializeLogContext(context map[string]any) (string, error) {
	if context == nil || len(context) == 0 {
		return "{}", nil
	}
	raw, err := json.Marshal(context)
	if err != nil {
		return "", err
	}
	return string(raw), nil
}

func DeserializeLogContext(raw string) (map[string]any, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" || trimmed == "{}" {
		return nil, nil
	}
	var context map[string]any
	if err := json.Unmarshal([]byte(trimmed), &context); err != nil {
		return nil, err
	}
	return context, nil
}

func normalizeLogService(service string) (string, error) {
	clean := strings.ToLower(strings.TrimSpace(service))
	if !allowedLogServices[clean] {
		return "", fmt.Errorf("invalid service %q", service)
	}
	return clean, nil
}

func normalizeLogLevel(level string) string {
	clean := strings.ToLower(strings.TrimSpace(level))
	if allowedLogLevels[clean] {
		return clean
	}
	return LogLevelInfo
}

func (s *Store) AppendLog(input AppendLogInput) (int64, error) {
	service, err := normalizeLogService(input.Service)
	if err != nil {
		return 0, err
	}

	message := strings.TrimSpace(input.Message)
	if message == "" {
		return 0, fmt.Errorf("message is required")
	}

	level := normalizeLogLevel(input.Level)
	contextJSON, err := SerializeLogContext(input.Context)
	if err != nil {
		return 0, err
	}

	createdAt := strings.TrimSpace(input.CreatedAt)
	if createdAt == "" {
		createdAt = time.Now().UTC().Format(time.RFC3339)
	}

	result, err := s.DB.Exec(`
INSERT INTO service_logs (service, level, message, context_json, created_at)
VALUES (?, ?, ?, ?, ?)`, service, level, message, contextJSON, createdAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (s *Store) AppendLogs(inputs []AppendLogInput) (int, error) {
	if len(inputs) == 0 {
		return 0, nil
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer func() {
		_ = tx.Rollback()
	}()

	inserted := 0
	for _, input := range inputs {
		service, err := normalizeLogService(input.Service)
		if err != nil {
			return inserted, err
		}
		message := strings.TrimSpace(input.Message)
		if message == "" {
			continue
		}
		level := normalizeLogLevel(input.Level)
		contextJSON, err := SerializeLogContext(input.Context)
		if err != nil {
			return inserted, err
		}
		createdAt := strings.TrimSpace(input.CreatedAt)
		if createdAt == "" {
			createdAt = time.Now().UTC().Format(time.RFC3339)
		}

		if _, err := tx.Exec(`
INSERT INTO service_logs (service, level, message, context_json, created_at)
VALUES (?, ?, ?, ?, ?)`, service, level, message, contextJSON, createdAt); err != nil {
			return inserted, err
		}
		inserted++
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return inserted, nil
}

func (s *Store) ListLogs(query ListLogsQuery) ([]ServiceLog, error) {
	limit := query.Limit
	if limit <= 0 {
		limit = 200
	}
	if limit > 1000 {
		limit = 1000
	}

	clauses := make([]string, 0, 3)
	args := make([]any, 0, 4)

	serviceFilter := strings.TrimSpace(query.Service)
	if serviceFilter != "" {
		service, err := normalizeLogService(serviceFilter)
		if err != nil {
			return nil, err
		}
		clauses = append(clauses, "service = ?")
		args = append(args, service)
	}

	levelFilter := strings.ToLower(strings.TrimSpace(query.Level))
	if levelFilter != "" {
		if !allowedLogLevels[levelFilter] {
			return nil, fmt.Errorf("invalid level %q", query.Level)
		}
		clauses = append(clauses, "level = ?")
		args = append(args, levelFilter)
	}

	if query.SinceID > 0 {
		clauses = append(clauses, "id > ?")
		args = append(args, query.SinceID)
	}

	sqlQuery := `
SELECT id, service, level, message, context_json, created_at
FROM service_logs`
	if len(clauses) > 0 {
		sqlQuery += " WHERE " + strings.Join(clauses, " AND ")
	}
	sqlQuery += " ORDER BY id DESC LIMIT ?"
	args = append(args, limit)

	rows, err := s.DB.Query(sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := make([]ServiceLog, 0, limit)
	for rows.Next() {
		var item ServiceLog
		var contextRaw string
		if err := rows.Scan(
			&item.ID,
			&item.Service,
			&item.Level,
			&item.Message,
			&contextRaw,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		context, err := DeserializeLogContext(contextRaw)
		if err != nil {
			return nil, err
		}
		item.Context = context
		logs = append(logs, item)
	}
	if logs == nil {
		logs = []ServiceLog{}
	}
	return logs, rows.Err()
}

func (s *Store) CountLogs() (int64, error) {
	var count sql.NullInt64
	err := s.DB.QueryRow(`SELECT COUNT(*) FROM service_logs`).Scan(&count)
	if err != nil {
		return 0, err
	}
	if !count.Valid {
		return 0, nil
	}
	return count.Int64, nil
}
