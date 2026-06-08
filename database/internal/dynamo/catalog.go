package dynamo

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/eduardoos/database/internal/db"
)

type catalogItem struct {
	PK         string         `dynamodbav:"PK"`
	SK         string         `dynamodbav:"SK"`
	EntityType string         `dynamodbav:"entity_type"`
	Slug       string         `dynamodbav:"slug"`
	Name       string         `dynamodbav:"name,omitempty"`
	SeriesSlug string         `dynamodbav:"series_slug,omitempty"`
	Hub        map[string]any `dynamodbav:"hub,omitempty"`
	CreatedAt  string         `dynamodbav:"created_at,omitempty"`
	UpdatedAt  string         `dynamodbav:"updated_at,omitempty"`
}

func (s *Store) scanCatalog(ctx context.Context) ([]catalogItem, error) {
	var items []catalogItem
	var startKey map[string]types.AttributeValue

	for {
		out, err := s.client.Scan(ctx, &dynamodb.ScanInput{
			TableName:         aws.String(s.catalogTable),
			ExclusiveStartKey: startKey,
		})
		if err != nil {
			return nil, err
		}

		var page []catalogItem
		if err := attributevalue.UnmarshalListOfMaps(out.Items, &page); err != nil {
			return nil, err
		}
		items = append(items, page...)

		if len(out.LastEvaluatedKey) == 0 {
			break
		}
		startKey = out.LastEvaluatedKey
	}
	return items, nil
}

func (s *Store) BuildCatalog() (db.Catalog, error) {
	items, err := s.scanCatalog(context.Background())
	if err != nil {
		return db.Catalog{}, err
	}

	catalog := db.Catalog{
		Series:     []string{},
		SeriesMeta: map[string]db.SeriesMeta{},
		Chapters:   map[string][]string{},
	}

	seriesSet := map[string]bool{}
	chapterSet := map[string]map[string]bool{}

	for _, item := range items {
		seriesSlug := seriesSlugFromPK(item.PK)
		if seriesSlug == "" {
			continue
		}

		if item.SK == skMeta {
			if !seriesSet[seriesSlug] {
				seriesSet[seriesSlug] = true
				catalog.Series = append(catalog.Series, seriesSlug)
			}
			name := strings.TrimSpace(item.Name)
			if name == "" {
				name = seriesSlug
			}
			catalog.SeriesMeta[seriesSlug] = db.SeriesMeta{Name: name}
			continue
		}

		if !strings.HasPrefix(item.SK, "CHAPTER#") {
			continue
		}
		chapter := chapterFromSK(item.SK)
		if chapter == "" {
			continue
		}
		if !seriesSet[seriesSlug] {
			seriesSet[seriesSlug] = true
			catalog.Series = append(catalog.Series, seriesSlug)
			if _, ok := catalog.SeriesMeta[seriesSlug]; !ok {
				catalog.SeriesMeta[seriesSlug] = db.SeriesMeta{Name: seriesSlug}
			}
		}
		if chapterSet[seriesSlug] == nil {
			chapterSet[seriesSlug] = map[string]bool{}
		}
		if !chapterSet[seriesSlug][chapter] {
			chapterSet[seriesSlug][chapter] = true
			catalog.Chapters[seriesSlug] = append(catalog.Chapters[seriesSlug], chapter)
		}
	}

	sort.Strings(catalog.Series)
	for slug := range catalog.Chapters {
		sort.Strings(catalog.Chapters[slug])
	}

	return catalog, nil
}

func (s *Store) ListSeries() ([]db.Series, error) {
	items, err := s.scanCatalog(context.Background())
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC().Format(time.RFC3339)
	bySlug := map[string]db.Series{}

	for _, item := range items {
		if item.SK != skMeta {
			continue
		}
		slug := seriesSlugFromPK(item.PK)
		if slug == "" {
			continue
		}
		name := strings.TrimSpace(item.Name)
		if name == "" {
			name = slug
		}
		created := item.CreatedAt
		if created == "" {
			created = now
		}
		updated := item.UpdatedAt
		if updated == "" {
			updated = created
		}
		bySlug[slug] = db.Series{
			ID:        seriesIDFromSlug(slug),
			Slug:      slug,
			Name:      name,
			CreatedAt: created,
			UpdatedAt: updated,
		}
	}

	out := make([]db.Series, 0, len(bySlug))
	for _, item := range bySlug {
		out = append(out, item)
	}
	sort.Slice(out, func(i, j int) bool {
		return strings.ToLower(out[i].Slug) < strings.ToLower(out[j].Slug)
	})
	return out, nil
}

func (s *Store) GetHub(seriesSlug, chapter string) (map[string]any, error) {
	out, err := s.client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(s.catalogTable),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: seriesPK(seriesSlug)},
			"SK": &types.AttributeValueMemberS{Value: chapterSK(chapter)},
		},
	})
	if err != nil {
		return nil, err
	}
	if out.Item == nil {
		return nil, fmt.Errorf("hub not found")
	}

	var item catalogItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		return nil, err
	}
	if item.Hub == nil {
		return nil, fmt.Errorf("hub not found")
	}
	return item.Hub, nil
}

func (s *Store) SaveCatalogEntry(seriesSlug, seriesName, chapter string, hub map[string]any) error {
	seriesSlug = strings.TrimSpace(seriesSlug)
	seriesName = strings.TrimSpace(seriesName)
	chapter = strings.TrimSpace(chapter)
	if seriesSlug == "" {
		return fmt.Errorf("series slug is required")
	}

	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)

	if err := s.upsertSeriesMeta(ctx, seriesSlug, seriesName, now); err != nil {
		return err
	}

	if chapter == "" {
		return nil
	}
	if hub == nil || len(hub) == 0 {
		return nil
	}

	merged, err := s.mergeCatalogHub(seriesSlug, chapter, hub)
	if err != nil {
		return err
	}

	item := catalogItem{
		PK:         seriesPK(seriesSlug),
		SK:         chapterSK(chapter),
		EntityType: "chapter",
		Slug:       chapter,
		SeriesSlug: seriesSlug,
		Hub:        merged,
		UpdatedAt:  now,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return err
	}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.catalogTable),
		Item:      av,
	})
	return err
}

func (s *Store) upsertSeriesMeta(ctx context.Context, slug, name, now string) error {
	if name == "" {
		name = slug
	}

	existing, _ := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.catalogTable),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: seriesPK(slug)},
			"SK": &types.AttributeValueMemberS{Value: skMeta},
		},
	})

	created := now
	if existing != nil && existing.Item != nil {
		var prior catalogItem
		if err := attributevalue.UnmarshalMap(existing.Item, &prior); err == nil && prior.CreatedAt != "" {
			created = prior.CreatedAt
		}
	}

	item := catalogItem{
		PK:         seriesPK(slug),
		SK:         skMeta,
		EntityType: "series",
		Slug:       slug,
		Name:       name,
		CreatedAt:  created,
		UpdatedAt:  now,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return err
	}
	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.catalogTable),
		Item:      av,
	})
	return err
}

func (s *Store) mergeCatalogHub(seriesSlug, chapter string, hub map[string]any) (map[string]any, error) {
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

func (s *Store) ensureHubPostEntry(
	seriesSlug, chapter, postSlug, title string,
	hubEntry map[string]any,
) error {
	postSlug = strings.TrimSpace(postSlug)
	if postSlug == "" {
		return nil
	}

	hub, err := s.GetHub(seriesSlug, chapter)
	if err != nil {
		hub = map[string]any{
			"series":  seriesSlug,
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

	return s.SaveCatalogEntry(seriesSlug, seriesSlug, chapter, hub)
}

func seriesIDFromSlug(slug string) int64 {
	var h int64
	for i, c := range slug {
		h = h*31 + int64(c) + int64(i)
	}
	if h < 0 {
		h = -h
	}
	if h == 0 {
		h = 1
	}
	return h
}

func fmtAny(value any) string {
	if value == nil {
		return ""
	}
	if typed, ok := value.(string); ok {
		return typed
	}
	raw, _ := json.Marshal(value)
	return strings.TrimSpace(string(raw))
}
