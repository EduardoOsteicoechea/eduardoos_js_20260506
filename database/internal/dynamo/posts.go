package dynamo

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/eduardoos/database/internal/db"
)

type postItem struct {
	PK         string                `dynamodbav:"PK"`
	SK         string                `dynamodbav:"SK"`
	GSI1PK     string                `dynamodbav:"gsi1pk"`
	GSI1SK     string                `dynamodbav:"gsi1sk"`
	SeriesSlug string                `dynamodbav:"series_slug"`
	Chapter    string                `dynamodbav:"chapter"`
	Slug       string                `dynamodbav:"slug"`
	Title      string                `dynamodbav:"title"`
	Author     string                `dynamodbav:"author"`
	SortOrder  int                   `dynamodbav:"sort_order"`
	SermonURL  string                `dynamodbav:"sermon_url,omitempty"`
	HubEntry   map[string]any        `dynamodbav:"hub_entry,omitempty"`
	Metadata   map[string]any        `dynamodbav:"metadata,omitempty"`
	Sections   []db.SaveSectionInput `dynamodbav:"sections,omitempty"`
	CreatedAt  string                `dynamodbav:"created_at,omitempty"`
	UpdatedAt  string                `dynamodbav:"updated_at,omitempty"`
}

func (s *Store) getPostItem(seriesSlug, chapter, slug string) (*postItem, error) {
	out, err := s.client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(s.postsTable),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: postPK(seriesSlug, chapter, slug)},
			"SK": &types.AttributeValueMemberS{Value: skVersion},
		},
	})
	if err != nil {
		return nil, err
	}
	if out.Item == nil {
		return nil, fmt.Errorf("article not found")
	}
	var item postItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *Store) ListPosts(seriesSlug, chapter string) ([]db.ArticleOption, error) {
	out, err := s.client.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(s.postsTable),
		IndexName:              aws.String(gsiChapter),
		KeyConditionExpression: aws.String("gsi1pk = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: chapterGSI1PK(seriesSlug, chapter)},
		},
	})
	if err != nil {
		return nil, err
	}

	var items []postItem
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		return nil, err
	}

	outList := make([]db.ArticleOption, 0, len(items))
	for _, item := range items {
		id := item.SortOrder
		outList = append(outList, db.ArticleOption{
			ID:        &id,
			ArticleID: item.Slug,
			Title:     item.Title,
		})
	}
	if outList == nil {
		outList = []db.ArticleOption{}
	}
	return outList, nil
}

func (s *Store) GetPostByID(id int64) (db.Post, error) {
	items, err := s.scanCurrentPosts(context.Background())
	if err != nil {
		return db.Post{}, err
	}
	for _, item := range items {
		if int64(item.SortOrder) == id {
			return postToModel(item), nil
		}
	}
	return db.Post{}, fmt.Errorf("post not found")
}

func (s *Store) GetPostID(seriesSlug, chapter, slug string) (int64, error) {
	item, err := s.getPostItem(seriesSlug, chapter, slug)
	if err != nil {
		return 0, err
	}
	return int64(item.SortOrder), nil
}

func (s *Store) GetArticle(seriesSlug, chapter, slug string) (map[string]any, string, error) {
	item, err := s.getPostItem(seriesSlug, chapter, slug)
	if err != nil {
		return nil, "", err
	}

	sections := db.SectionsToAPI(item.Sections)
	article := map[string]any{
		"serie":    seriesSlug,
		"series":   seriesSlug,
		"chapter":  chapter,
		"section":  chapter,
		"title":    item.Title,
		"creator":  item.Author,
		"sections": sections,
	}
	if item.Metadata != nil {
		for key, value := range item.Metadata {
			if key == "title" || key == "sections" {
				continue
			}
			article[key] = value
		}
	}
	return article, item.SermonURL, nil
}

func (s *Store) NextArticleSortOrder(seriesSlug, chapter string) (int, error) {
	out, err := s.client.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(s.postsTable),
		IndexName:              aws.String(gsiChapter),
		KeyConditionExpression: aws.String("gsi1pk = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: chapterGSI1PK(seriesSlug, chapter)},
		},
		ProjectionExpression: aws.String("sort_order"),
	})
	if err != nil {
		return 1, err
	}

	maxOrder := 0
	for _, row := range out.Items {
		if v, ok := row["sort_order"]; ok {
			if n, ok := v.(*types.AttributeValueMemberN); ok {
				parsed, _ := strconv.Atoi(n.Value)
				if parsed > maxOrder {
					maxOrder = parsed
				}
			}
		}
	}
	if maxOrder == 0 {
		return 1, nil
	}
	return maxOrder + 1, nil
}

func (s *Store) SaveArticle(input db.SaveArticleInput) (int64, int, error) {
	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)

	if err := s.upsertSeriesMeta(ctx, input.SeriesSlug, input.SeriesSlug, now); err != nil {
		return 0, 0, err
	}

	existing, existingErr := s.getPostItem(input.SeriesSlug, input.Chapter, input.Slug)
	created := now
	if existingErr == nil && existing != nil && existing.CreatedAt != "" {
		created = existing.CreatedAt
	}

	item := postItem{
		PK:         postPK(input.SeriesSlug, input.Chapter, input.Slug),
		SK:         skVersion,
		GSI1PK:     chapterGSI1PK(input.SeriesSlug, input.Chapter),
		GSI1SK:     sortGSI1SK(input.SortOrder, input.Slug),
		SeriesSlug: input.SeriesSlug,
		Chapter:    input.Chapter,
		Slug:       input.Slug,
		Title:      input.Title,
		Author:     input.Author,
		SortOrder:  input.SortOrder,
		SermonURL:  input.SermonURL,
		HubEntry:   input.HubEntry,
		Metadata:   input.Metadata,
		Sections:   input.Sections,
		CreatedAt:  created,
		UpdatedAt:  now,
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return 0, 0, err
	}
	if _, err := s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.postsTable),
		Item:      av,
	}); err != nil {
		return 0, 0, err
	}

	if err := s.ensureHubPostEntry(input.SeriesSlug, input.Chapter, input.Slug, input.Title, input.HubEntry); err != nil {
		return 0, 0, err
	}

	postID := int64(input.SortOrder)
	return postID, input.SortOrder, nil
}

func (s *Store) BuildDiscover() (db.DiscoverPayload, error) {
	items, err := s.scanCurrentPosts(context.Background())
	if err != nil {
		return db.DiscoverPayload{}, err
	}

	sort.Slice(items, func(i, j int) bool {
		left := items[i]
		right := items[j]
		if left.SeriesSlug != right.SeriesSlug {
			return left.SeriesSlug < right.SeriesSlug
		}
		if left.Chapter != right.Chapter {
			return left.Chapter < right.Chapter
		}
		if left.SortOrder != right.SortOrder {
			return left.SortOrder < right.SortOrder
		}
		return left.Slug < right.Slug
	})

	payload := db.DiscoverPayload{
		Articles: []db.DiscoverArticle{},
		Hubs:     []db.DiscoverHub{},
		Slugs:    []string{},
	}
	slugSet := map[string]bool{}

	for _, item := range items {
		article, sermon, err := s.GetArticle(item.SeriesSlug, item.Chapter, item.Slug)
		if err != nil {
			continue
		}
		if sermon == "" {
			sermon = item.SermonURL
		}

		fullSlug := fmt.Sprintf("%s/%s/%s", item.SeriesSlug, item.Chapter, item.Slug)
		payload.Articles = append(payload.Articles, db.DiscoverArticle{
			Slug:      fullSlug,
			Data:      article,
			SermonURL: sermon,
		})

		for _, part := range []string{
			item.SeriesSlug,
			fmt.Sprintf("%s/%s", item.SeriesSlug, item.Chapter),
			fullSlug,
		} {
			if !slugSet[part] {
				slugSet[part] = true
				payload.Slugs = append(payload.Slugs, part)
			}
		}
	}

	catalogItems, err := s.scanCatalog(context.Background())
	if err != nil {
		return db.DiscoverPayload{}, err
	}
	for _, row := range catalogItems {
		if !strings.HasPrefix(row.SK, "CHAPTER#") || row.Hub == nil {
			continue
		}
		seriesSlug := seriesSlugFromPK(row.PK)
		chapter := chapterFromSK(row.SK)
		hubSlug := fmt.Sprintf("%s/%s", seriesSlug, chapter)
		payload.Hubs = append(payload.Hubs, db.DiscoverHub{
			Slug: hubSlug,
			Data: row.Hub,
		})
		for _, part := range []string{seriesSlug, hubSlug} {
			if !slugSet[part] {
				slugSet[part] = true
				payload.Slugs = append(payload.Slugs, part)
			}
		}
	}

	return payload, nil
}

func (s *Store) scanCurrentPosts(ctx context.Context) ([]postItem, error) {
	var items []postItem
	var startKey map[string]types.AttributeValue

	for {
		out, err := s.client.Scan(ctx, &dynamodb.ScanInput{
			TableName:                 aws.String(s.postsTable),
			FilterExpression:          aws.String("SK = :sk"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":sk": &types.AttributeValueMemberS{Value: skVersion},
			},
			ExclusiveStartKey: startKey,
		})
		if err != nil {
			return nil, err
		}

		var page []postItem
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

func postToModel(item postItem) db.Post {
	created := item.CreatedAt
	updated := item.UpdatedAt
	if created == "" {
		created = item.UpdatedAt
	}
	return db.Post{
		ID:         int64(item.SortOrder),
		SeriesID:   seriesIDFromSlug(item.SeriesSlug),
		SeriesSlug: item.SeriesSlug,
		Chapter:    item.Chapter,
		Slug:       item.Slug,
		Title:      item.Title,
		Author:     item.Author,
		SortOrder:  item.SortOrder,
		CreatedAt:  created,
		UpdatedAt:  updated,
	}
}
