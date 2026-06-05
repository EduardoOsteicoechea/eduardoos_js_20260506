package db

import (
	"database/sql"
	"fmt"
	"strings"
)

func (s *Store) ListSeries() ([]Series, error) {
	rows, err := s.DB.Query(`
SELECT id, slug, name, created_at, updated_at
FROM series
ORDER BY slug COLLATE NOCASE`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Series
	for rows.Next() {
		var item Series
		if err := rows.Scan(&item.ID, &item.Slug, &item.Name, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) BuildCatalog() (Catalog, error) {
	seriesRows, err := s.ListSeries()
	if err != nil {
		return Catalog{}, err
	}

	catalog := Catalog{
		Series:   make([]string, 0, len(seriesRows)),
		Chapters: make(map[string][]string),
	}

	for _, serie := range seriesRows {
		catalog.Series = append(catalog.Series, serie.Slug)
		chapters, err := s.listChaptersForSeriesID(serie.ID)
		if err != nil {
			return Catalog{}, err
		}
		catalog.Chapters[serie.Slug] = chapters
	}

	return catalog, nil
}

func (s *Store) listChaptersForSeriesID(seriesID int64) ([]string, error) {
	rows, err := s.DB.Query(`
SELECT DISTINCT chapter
FROM posts
WHERE series_id = ?
ORDER BY chapter COLLATE NOCASE`, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chapters []string
	for rows.Next() {
		var chapter string
		if err := rows.Scan(&chapter); err != nil {
			return nil, err
		}
		chapters = append(chapters, chapter)
	}
	if chapters == nil {
		chapters = []string{}
	}
	return chapters, rows.Err()
}

func (s *Store) ListPosts(seriesSlug, chapter string) ([]ArticleOption, error) {
	rows, err := s.DB.Query(`
SELECT p.sort_order, p.slug, p.title
FROM posts p
JOIN series s ON s.id = p.series_id
WHERE s.slug = ? AND p.chapter = ?
ORDER BY p.sort_order ASC, p.slug COLLATE NOCASE`, seriesSlug, chapter)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []ArticleOption
	for rows.Next() {
		var sortOrder int
		var slug string
		var title string
		if err := rows.Scan(&sortOrder, &slug, &title); err != nil {
			return nil, err
		}
		id := sortOrder
		out = append(out, ArticleOption{
			ID:        &id,
			ArticleID: slug,
			Title:     title,
		})
	}
	if out == nil {
		out = []ArticleOption{}
	}
	return out, rows.Err()
}

func (s *Store) GetPostByID(id int64) (Post, error) {
	var post Post
	err := s.DB.QueryRow(`
SELECT p.id, p.series_id, s.slug, p.chapter, p.slug, p.title, p.author,
       p.sort_order, p.created_at, p.updated_at
FROM posts p
JOIN series s ON s.id = p.series_id
WHERE p.id = ?`, id).Scan(
		&post.ID,
		&post.SeriesID,
		&post.SeriesSlug,
		&post.Chapter,
		&post.Slug,
		&post.Title,
		&post.Author,
		&post.SortOrder,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return Post{}, fmt.Errorf("post not found")
	}
	return post, err
}

func (s *Store) UpsertSeries(slug, name string) (int64, error) {
	slug = strings.TrimSpace(slug)
	name = strings.TrimSpace(name)
	if slug == "" {
		return 0, fmt.Errorf("series slug is required")
	}
	if name == "" {
		name = slug
	}

	_, err := s.DB.Exec(`
INSERT INTO series (slug, name, updated_at)
VALUES (?, ?, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  updated_at = datetime('now')`, slug, name)
	if err != nil {
		return 0, err
	}

	var id int64
	err = s.DB.QueryRow(`SELECT id FROM series WHERE slug = ?`, slug).Scan(&id)
	return id, err
}

func (s *Store) UpsertPost(seriesID int64, chapter, slug, title, author string, sortOrder int) error {
	chapter = strings.TrimSpace(chapter)
	slug = strings.TrimSpace(slug)
	title = strings.TrimSpace(title)
	author = strings.TrimSpace(author)

	if chapter == "" || slug == "" {
		return fmt.Errorf("chapter and slug are required")
	}
	if title == "" {
		title = slug
	}

	_, err := s.DB.Exec(`
INSERT INTO posts (series_id, chapter, slug, title, author, sort_order, updated_at)
VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
ON CONFLICT(series_id, chapter, slug) DO UPDATE SET
  title = excluded.title,
  author = excluded.author,
  sort_order = excluded.sort_order,
  updated_at = datetime('now')`,
		seriesID, chapter, slug, title, author, sortOrder,
	)
	return err
}
