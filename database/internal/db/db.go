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

	if _, err := conn.Exec(`PRAGMA journal_mode = WAL;`); err != nil {
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

func (s *Store) migrate() error {
	for _, stmt := range []string{
		createSeriesTable,
		createPostsTable,
		createPostsSeriesChapterIndex,
	} {
		if _, err := s.DB.Exec(stmt); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	return nil
}
