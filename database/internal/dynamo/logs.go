package dynamo

import (
	"time"

	"github.com/eduardoos/database/internal/db"
)

// Service logs are not stored in DynamoDB yet (no eduardoos_service_logs table).
// Endpoints succeed with empty reads so the API stays compatible.

func (s *Store) AppendLog(input db.AppendLogInput) (int64, error) {
	return time.Now().UnixNano(), nil
}

func (s *Store) AppendLogs(inputs []db.AppendLogInput) (int, error) {
	return len(inputs), nil
}

func (s *Store) ListLogs(_ db.ListLogsQuery) ([]db.ServiceLog, error) {
	return []db.ServiceLog{}, nil
}

func (s *Store) CountLogs() (int64, error) {
	return 0, nil
}
