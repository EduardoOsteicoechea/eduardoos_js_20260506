package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
)

type SaveArticleInput struct {
	SeriesSlug  string
	Chapter     string
	Slug        string
	Title       string
	Author      string
	SortOrder   int
	SermonURL   string
	Metadata    map[string]any
	HubEntry    map[string]any
	Sections    []SaveSectionInput
}

type SaveSectionInput struct {
	Heading   string
	SortOrder int
	Quiz      []any
	Units     []SaveUnitInput
}

type SaveUnitInput struct {
	Type      string
	Content   map[string]any
	SortOrder int
}

type DiscoverArticle struct {
	Slug      string         `json:"slug"`
	Data      map[string]any `json:"data"`
	SermonURL string         `json:"sermon_url,omitempty"`
}

type DiscoverHub struct {
	Slug string         `json:"slug"`
	Data map[string]any `json:"data"`
}

type DiscoverPayload struct {
	Articles []DiscoverArticle `json:"articles"`
	Hubs     []DiscoverHub     `json:"hubs"`
	Slugs    []string          `json:"slugs"`
}

func (s *Store) listChaptersForSeriesID(seriesID int64) ([]string, error) {
	rows, err := s.DB.Query(`
SELECT slug FROM chapters WHERE series_id = ?
UNION
SELECT DISTINCT chapter FROM posts WHERE series_id = ?
ORDER BY slug COLLATE NOCASE`, seriesID, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	seen := map[string]bool{}
	var chapters []string
	for rows.Next() {
		var chapter string
		if err := rows.Scan(&chapter); err != nil {
			return nil, err
		}
		if seen[chapter] {
			continue
		}
		seen[chapter] = true
		chapters = append(chapters, chapter)
	}
	if chapters == nil {
		chapters = []string{}
	}
	return chapters, rows.Err()
}

func (s *Store) UpsertChapter(seriesID int64, slug string, hub map[string]any) error {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return fmt.Errorf("chapter slug is required")
	}
	raw, err := json.Marshal(hub)
	if err != nil {
		return err
	}
	_, err = s.DB.Exec(`
INSERT INTO chapters (series_id, slug, hub_json, updated_at)
VALUES (?, ?, ?, datetime('now'))
ON CONFLICT(series_id, slug) DO UPDATE SET
  hub_json = excluded.hub_json,
  updated_at = datetime('now')`, seriesID, slug, string(raw))
	return err
}

func hubPostsCount(hub map[string]any) int {
	if hub == nil {
		return 0
	}
	posts, ok := hub["posts"]
	if !ok {
		return 0
	}
	switch typed := posts.(type) {
	case []any:
		return len(typed)
	case []map[string]any:
		return len(typed)
	default:
		return 0
	}
}

func (s *Store) mergeCatalogHub(seriesSlug, chapter string, hub map[string]any) (map[string]any, error) {
	if hub == nil {
		return map[string]any{}, nil
	}
	if hubPostsCount(hub) > 0 {
		return hub, nil
	}

	existing, err := s.GetHub(seriesSlug, chapter)
	if err != nil || hubPostsCount(existing) == 0 {
		return hub, nil
	}

	merged := make(map[string]any, len(hub)+1)
	for key, value := range hub {
		merged[key] = value
	}
	merged["posts"] = existing["posts"]
	return merged, nil
}

func (s *Store) GetHub(seriesSlug, chapter string) (map[string]any, error) {
	var raw string
	err := s.DB.QueryRow(`
SELECT c.hub_json
FROM chapters c
JOIN series s ON s.id = c.series_id
WHERE s.slug = ? AND c.slug = ?`, seriesSlug, chapter).Scan(&raw)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("hub not found")
	}
	if err != nil {
		return nil, err
	}

	var hub map[string]any
	if err := json.Unmarshal([]byte(raw), &hub); err != nil {
		return nil, err
	}
	return hub, nil
}

func (s *Store) GetPostID(seriesSlug, chapter, slug string) (int64, error) {
	var id int64
	err := s.DB.QueryRow(`
SELECT p.id
FROM posts p
JOIN series s ON s.id = p.series_id
WHERE s.slug = ? AND p.chapter = ? AND p.slug = ?`, seriesSlug, chapter, slug).Scan(&id)
	return id, err
}

func (s *Store) GetArticle(seriesSlug, chapter, slug string) (map[string]any, string, error) {
	var postID int64
	var title, author, sermonURL, metadataRaw string
	err := s.DB.QueryRow(`
SELECT p.id, p.title, p.author, p.sermon_url, p.metadata_json
FROM posts p
JOIN series s ON s.id = p.series_id
WHERE s.slug = ? AND p.chapter = ? AND p.slug = ?`,
		seriesSlug, chapter, slug,
	).Scan(&postID, &title, &author, &sermonURL, &metadataRaw)
	if err == sql.ErrNoRows {
		return nil, "", fmt.Errorf("article not found")
	}
	if err != nil {
		return nil, "", err
	}

	sections, err := s.loadSections(postID)
	if err != nil {
		return nil, "", err
	}

	article := map[string]any{
		"serie":    seriesSlug,
		"series":   seriesSlug,
		"chapter":  chapter,
		"section":  chapter,
		"title":    title,
		"creator":  author,
		"sections": sections,
	}

	if metadataRaw != "" && metadataRaw != "{}" {
		var metadata map[string]any
		if err := json.Unmarshal([]byte(metadataRaw), &metadata); err == nil {
			for key, value := range metadata {
				if key == "title" || key == "sections" {
					continue
				}
				article[key] = value
			}
		}
	}

	return article, sermonURL, nil
}

func (s *Store) loadSections(postID int64) ([]map[string]any, error) {
	rows, err := s.DB.Query(`
SELECT id, heading, quiz_json
FROM post_sections
WHERE post_id = ?
ORDER BY sort_order ASC, id ASC`, postID)
	if err != nil {
		return nil, err
	}

	type sectionRow struct {
		id      int64
		heading string
		quizRaw sql.NullString
	}

	var sectionRows []sectionRow
	for rows.Next() {
		var row sectionRow
		if err := rows.Scan(&row.id, &row.heading, &row.quizRaw); err != nil {
			_ = rows.Close()
			return nil, err
		}
		sectionRows = append(sectionRows, row)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	var sections []map[string]any
	for _, row := range sectionRows {
		content, err := s.loadUnits(row.id)
		if err != nil {
			return nil, err
		}

		section := map[string]any{
			"heading": row.heading,
			"content": content,
		}

		if row.quizRaw.Valid && strings.TrimSpace(row.quizRaw.String) != "" {
			var quiz []any
			if err := json.Unmarshal([]byte(row.quizRaw.String), &quiz); err == nil && len(quiz) > 0 {
				section["quiz"] = quiz
			}
		}

		sections = append(sections, section)
	}

	if sections == nil {
		sections = []map[string]any{}
	}
	return sections, nil
}

func (s *Store) loadUnits(sectionID int64) ([]map[string]any, error) {
	rows, err := s.DB.Query(`
SELECT type, content_json
FROM post_section_units
WHERE section_id = ?
ORDER BY sort_order ASC, id ASC`, sectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blocks []map[string]any
	for rows.Next() {
		var unitType, raw string
		if err := rows.Scan(&unitType, &raw); err != nil {
			return nil, err
		}
		block, err := blockFromUnit(unitType, raw)
		if err != nil {
			return nil, err
		}
		if len(block) > 0 {
			block["type"] = unitType
			blocks = append(blocks, block)
		}
	}
	if blocks == nil {
		blocks = []map[string]any{}
	}
	return blocks, rows.Err()
}

func (s *Store) SaveArticle(input SaveArticleInput) (int64, int, error) {
	seriesID, err := s.UpsertSeries(input.SeriesSlug, input.SeriesSlug)
	if err != nil {
		return 0, 0, err
	}

	hubEntryRaw, _ := json.Marshal(input.HubEntry)
	metadataRaw, _ := json.Marshal(input.Metadata)

	var postID int64
	err = s.DB.QueryRow(`
SELECT id FROM posts
WHERE series_id = ? AND chapter = ? AND slug = ?`,
		seriesID, input.Chapter, input.Slug,
	).Scan(&postID)

	if err == sql.ErrNoRows {
		result, insertErr := s.DB.Exec(`
INSERT INTO posts (
  series_id, chapter, slug, title, author, sort_order,
  hub_entry_json, sermon_url, metadata_json, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
			seriesID, input.Chapter, input.Slug, input.Title, input.Author, input.SortOrder,
			string(hubEntryRaw), input.SermonURL, string(metadataRaw),
		)
		if insertErr != nil {
			return 0, 0, insertErr
		}
		postID, err = result.LastInsertId()
		if err != nil {
			return 0, 0, err
		}
	} else if err != nil {
		return 0, 0, err
	} else {
		_, err = s.DB.Exec(`
UPDATE posts SET
  title = ?, author = ?, sort_order = ?,
  hub_entry_json = ?, sermon_url = ?, metadata_json = ?,
  updated_at = datetime('now')
WHERE id = ?`,
			input.Title, input.Author, input.SortOrder,
			string(hubEntryRaw), input.SermonURL, string(metadataRaw), postID,
		)
		if err != nil {
			return 0, 0, err
		}
		if _, err := s.DB.Exec(`DELETE FROM post_sections WHERE post_id = ?`, postID); err != nil {
			return 0, 0, err
		}
	}

	for _, section := range input.Sections {
		quizRaw := ""
		if len(section.Quiz) > 0 {
			raw, marshalErr := json.Marshal(section.Quiz)
			if marshalErr != nil {
				return 0, 0, marshalErr
			}
			quizRaw = string(raw)
		}

		result, err := s.DB.Exec(`
INSERT INTO post_sections (post_id, heading, sort_order, quiz_json, updated_at)
VALUES (?, ?, ?, ?, datetime('now'))`,
			postID, section.Heading, section.SortOrder, nullIfEmpty(quizRaw),
		)
		if err != nil {
			return 0, 0, err
		}

		sectionID, err := result.LastInsertId()
		if err != nil {
			return 0, 0, err
		}

		for _, unit := range section.Units {
			contentRaw, err := json.Marshal(unit.Content)
			if err != nil {
				return 0, 0, err
			}
			_, err = s.DB.Exec(`
INSERT INTO post_section_units (section_id, type, content_json, sort_order, updated_at)
VALUES (?, ?, ?, ?, datetime('now'))`,
				sectionID, unit.Type, string(contentRaw), unit.SortOrder,
			)
			if err != nil {
				return 0, 0, err
			}
		}
	}

	if err := s.EnsureHubPostEntry(input.SeriesSlug, input.Chapter, input.Slug, input.Title, input.HubEntry); err != nil {
		return 0, 0, err
	}

	return postID, input.SortOrder, nil
}

func (s *Store) EnsureHubPostEntry(
	seriesSlug, chapter, postSlug, title string,
	hubEntry map[string]any,
) error {
	postSlug = strings.TrimSpace(postSlug)
	if postSlug == "" {
		return nil
	}

	seriesID, err := s.UpsertSeries(seriesSlug, seriesSlug)
	if err != nil {
		return err
	}

	hub, err := s.GetHub(seriesSlug, chapter)
	if err != nil {
		hub = map[string]any{
			"series": seriesSlug,
			"section": chapter,
			"posts":   []any{},
		}
	}

	posts, _ := hub["posts"].([]any)
	for _, item := range posts {
		post, ok := item.(map[string]any)
		if !ok {
			continue
		}
		if strings.TrimSpace(fmtAny(post["name"])) == postSlug {
			return nil
		}
	}

	contribution := strings.TrimSpace(title)
	abstract := ""
	if hubEntry != nil {
		if value := strings.TrimSpace(fmtAny(hubEntry["contribution"])); value != "" {
			contribution = value
		}
		if value := strings.TrimSpace(fmtAny(hubEntry["abstract"])); value != "" {
			abstract = value
		}
	}
	if contribution == "" {
		contribution = postSlug
	}

	posts = append(posts, map[string]any{
		"name":         postSlug,
		"contribution": contribution,
		"abstract":     abstract,
		"biblical_texts": []any{
			map[string]any{"reference": "", "text": ""},
		},
	})
	hub["posts"] = posts

	return s.UpsertChapter(seriesID, chapter, hub)
}

func nullIfEmpty(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func (s *Store) NextArticleSortOrder(seriesSlug, chapter string) (int, error) {
	var maxOrder sql.NullInt64
	err := s.DB.QueryRow(`
SELECT MAX(p.sort_order)
FROM posts p
JOIN series s ON s.id = p.series_id
WHERE s.slug = ? AND p.chapter = ?`, seriesSlug, chapter).Scan(&maxOrder)
	if err != nil {
		return 1, err
	}
	if !maxOrder.Valid {
		return 1, nil
	}
	return int(maxOrder.Int64) + 1, nil
}

func (s *Store) BuildDiscover() (DiscoverPayload, error) {
	rows, err := s.DB.Query(`
SELECT s.slug, p.chapter, p.slug, p.sermon_url
FROM posts p
JOIN series s ON s.id = p.series_id
ORDER BY s.slug, p.chapter, p.sort_order, p.slug`)
	if err != nil {
		return DiscoverPayload{}, err
	}

	type postRow struct {
		seriesSlug string
		chapter    string
		postSlug   string
		sermonURL  string
	}

	var postRows []postRow
	for rows.Next() {
		var row postRow
		if err := rows.Scan(&row.seriesSlug, &row.chapter, &row.postSlug, &row.sermonURL); err != nil {
			_ = rows.Close()
			return DiscoverPayload{}, err
		}
		postRows = append(postRows, row)
	}
	if err := rows.Close(); err != nil {
		return DiscoverPayload{}, err
	}
	if err := rows.Err(); err != nil {
		return DiscoverPayload{}, err
	}

	payload := DiscoverPayload{
		Articles: []DiscoverArticle{},
		Hubs:     []DiscoverHub{},
		Slugs:    []string{},
	}
	slugSet := map[string]bool{}

	for _, row := range postRows {
		article, sermon, err := s.GetArticle(row.seriesSlug, row.chapter, row.postSlug)
		if err != nil {
			continue
		}
		if sermon == "" {
			sermon = row.sermonURL
		}

		fullSlug := fmt.Sprintf("%s/%s/%s", row.seriesSlug, row.chapter, row.postSlug)
		payload.Articles = append(payload.Articles, DiscoverArticle{
			Slug:      fullSlug,
			Data:      article,
			SermonURL: sermon,
		})

		for _, part := range []string{
			row.seriesSlug,
			fmt.Sprintf("%s/%s", row.seriesSlug, row.chapter),
			fullSlug,
		} {
			if !slugSet[part] {
				slugSet[part] = true
				payload.Slugs = append(payload.Slugs, part)
			}
		}
	}

	hubRows, err := s.DB.Query(`
SELECT s.slug, c.slug, c.hub_json
FROM chapters c
JOIN series s ON s.id = c.series_id
ORDER BY s.slug, c.slug`)
	if err != nil {
		return DiscoverPayload{}, err
	}

	type hubRow struct {
		seriesSlug string
		chapter    string
		hubRaw     string
	}

	var hubs []hubRow
	for hubRows.Next() {
		var row hubRow
		if err := hubRows.Scan(&row.seriesSlug, &row.chapter, &row.hubRaw); err != nil {
			_ = hubRows.Close()
			return DiscoverPayload{}, err
		}
		hubs = append(hubs, row)
	}
	if err := hubRows.Close(); err != nil {
		return DiscoverPayload{}, err
	}
	if err := hubRows.Err(); err != nil {
		return DiscoverPayload{}, err
	}

	for _, row := range hubs {
		var hub map[string]any
		if err := json.Unmarshal([]byte(row.hubRaw), &hub); err != nil {
			continue
		}

		hubSlug := fmt.Sprintf("%s/%s", row.seriesSlug, row.chapter)
		payload.Hubs = append(payload.Hubs, DiscoverHub{
			Slug: hubSlug,
			Data: hub,
		})

		for _, part := range []string{row.seriesSlug, hubSlug} {
			if !slugSet[part] {
				slugSet[part] = true
				payload.Slugs = append(payload.Slugs, part)
			}
		}
	}

	return payload, nil
}

func ParseSaveArticlePayload(raw map[string]any) (SaveArticleInput, error) {
	seriesSlug := firstString(raw, "serie", "series")
	chapter := firstString(raw, "chapter", "section")
	slug := firstString(raw, "folder_name", "article_id")
	title := strings.TrimSpace(fmtAny(raw["title"]))
	author := firstString(raw, "creator")

	if seriesSlug == "" || chapter == "" || slug == "" {
		return SaveArticleInput{}, fmt.Errorf("serie, chapter and folder_name are required")
	}
	if title == "" {
		title = slug
	}

	hubEntry := map[string]any{}
	if entry, ok := raw["hub_entry"].(map[string]any); ok && entry != nil {
		hubEntry = entry
	}

	metadata := map[string]any{}
	for _, key := range []string{"chapter", "book", "chapters", "verses", "posts"} {
		if value, ok := raw[key]; ok {
			metadata[key] = value
		}
	}

	sectionsRaw, _ := raw["sections"].([]any)
	sections := make([]SaveSectionInput, 0, len(sectionsRaw))
	for sectionIndex, item := range sectionsRaw {
		sectionMap, ok := item.(map[string]any)
		if !ok {
			continue
		}
		heading := strings.TrimSpace(fmtAny(sectionMap["heading"]))
		var quiz []any
		if quizRaw, ok := sectionMap["quiz"].([]any); ok {
			quiz = quizRaw
		}

		contentRaw, _ := sectionMap["content"].([]any)
		units := make([]SaveUnitInput, 0, len(contentRaw))
		for unitIndex, blockItem := range contentRaw {
			block, ok := blockItem.(map[string]any)
			if !ok {
				continue
			}
			unitType := resolveUnitType(block)
			content := contentBlockForStorage(unitType, block)
			units = append(units, SaveUnitInput{
				Type:      unitType,
				Content:   content,
				SortOrder: unitIndex,
			})
		}

		sections = append(sections, SaveSectionInput{
			Heading:   heading,
			SortOrder: sectionIndex,
			Quiz:      quiz,
			Units:     units,
		})
	}

	return SaveArticleInput{
		SeriesSlug: seriesSlug,
		Chapter:    chapter,
		Slug:       slug,
		Title:      title,
		Author:     author,
		HubEntry:   hubEntry,
		Metadata:   metadata,
		Sections:   sections,
	}, nil
}

func firstString(raw map[string]any, keys ...string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(fmtAny(raw[key])); value != "" {
			return value
		}
	}
	return ""
}
