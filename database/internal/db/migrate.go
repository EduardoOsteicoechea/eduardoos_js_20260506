package db

import (
	"database/sql"
	"fmt"
)

func (s *Store) migrate() error {
	for _, stmt := range []string{
		createSeriesTable,
		createChaptersTable,
		createPostsTable,
		createPostSectionsTable,
		createPostSectionUnitsTable,
		createPostsSeriesChapterIndex,
		createPostSectionsPostIndex,
		createPostSectionUnitsSectionIndex,
	} {
		if _, err := s.DB.Exec(stmt); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}

	return s.ensurePostColumns()
}

func (s *Store) ensurePostColumns() error {
	columns, err := tableColumns(s.DB, "posts")
	if err != nil {
		return err
	}

	alterStatements := map[string]string{
		"hub_entry_json": `ALTER TABLE posts ADD COLUMN hub_entry_json TEXT NOT NULL DEFAULT '{}'`,
		"sermon_url":     `ALTER TABLE posts ADD COLUMN sermon_url TEXT NOT NULL DEFAULT ''`,
		"metadata_json":  `ALTER TABLE posts ADD COLUMN metadata_json TEXT NOT NULL DEFAULT '{}'`,
	}

	for column, stmt := range alterStatements {
		if columns[column] {
			continue
		}
		if _, err := s.DB.Exec(stmt); err != nil {
			return fmt.Errorf("add column %s: %w", column, err)
		}
	}

	return nil
}

func tableColumns(db *sql.DB, table string) (map[string]bool, error) {
	rows, err := db.Query(fmt.Sprintf("PRAGMA table_info(%s)", table))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := map[string]bool{}
	for rows.Next() {
		var cid int
		var name string
		var colType string
		var notNull int
		var defaultValue sql.NullString
		var pk int
		if err := rows.Scan(&cid, &name, &colType, &notNull, &defaultValue, &pk); err != nil {
			return nil, err
		}
		out[name] = true
	}
	return out, rows.Err()
}
