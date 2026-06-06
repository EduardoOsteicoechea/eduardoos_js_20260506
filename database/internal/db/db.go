package db

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

type Store struct {
	DB *sql.DB
}

func Open(path string) (*Store, error) {
	conn, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	conn.SetMaxOpenConns(1)

	// DELETE mode writes directly to posts.db (no -wal/-shm sidecars).
	// Required for Docker bind-mounting a single db file on Windows hosts.
	if _, err := conn.Exec(`PRAGMA journal_mode = DELETE;`); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("pragma journal_mode: %w", err)
	}
	if _, err := conn.Exec(`PRAGMA foreign_keys = ON;`); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("pragma foreign_keys: %w", err)
	}

	store := &Store{DB: conn}
	if err := store.migrate(); err != nil {
		_ = conn.Close()
		return nil, err
	}

	return store, nil
}

func (s *Store) Close() error {
	if s == nil || s.DB == nil {
		return nil
	}
	return s.DB.Close()
}

