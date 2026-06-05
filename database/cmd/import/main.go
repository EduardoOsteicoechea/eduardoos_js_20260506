package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/eduardoos/database/internal/db"
)

func main() {
	seriesRoot := flag.String("series-root", "../backend/public/data/series", "path to series data root")
	dbPath := flag.String("db", "posts.db", "sqlite database path")
	flag.Parse()

	store, err := db.Open(*dbPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer store.Close()

	importedHubs := 0
	importedArticles := 0

	serieEntries, err := os.ReadDir(*seriesRoot)
	if err != nil {
		log.Fatalf("read series root: %v", err)
	}

	for _, serieEntry := range serieEntries {
		if !serieEntry.IsDir() {
			continue
		}

		serieSlug := serieEntry.Name()
		if _, err := store.UpsertSeries(serieSlug, serieSlug); err != nil {
			log.Fatalf("upsert series %s: %v", serieSlug, err)
		}

		seriePath := filepath.Join(*seriesRoot, serieSlug)
		chapterEntries, err := os.ReadDir(seriePath)
		if err != nil {
			continue
		}

		for _, chapterEntry := range chapterEntries {
			if !chapterEntry.IsDir() {
				continue
			}

			chapterSlug := chapterEntry.Name()
			chapterPath := filepath.Join(seriePath, chapterSlug)
			hubPath := filepath.Join(chapterPath, "data.json")

			if hub, ok := readJSONFile(hubPath); ok && isHubData(hub) {
				seriesID, _ := store.UpsertSeries(serieSlug, serieSlug)
				_ = seriesID
				if err := store.UpsertChapter(seriesID, chapterSlug, hub); err != nil {
					log.Fatalf("upsert hub %s/%s: %v", serieSlug, chapterSlug, err)
				}
				importedHubs++
			}

			metaIDs := readHubPostIDs(hubPath)
			postEntries, err := os.ReadDir(chapterPath)
			if err != nil {
				continue
			}

			for _, postEntry := range postEntries {
				if !postEntry.IsDir() {
					continue
				}

				postSlug := postEntry.Name()
				articlePath := filepath.Join(chapterPath, postSlug, "data.json")
				article, ok := readJSONFile(articlePath)
				if !ok || !isArticleData(article) {
					continue
				}

				article["serie"] = serieSlug
				article["series"] = serieSlug
				article["chapter"] = chapterSlug
				article["section"] = chapterSlug
				article["folder_name"] = postSlug
				article["article_id"] = postSlug

				input, err := db.ParseSaveArticlePayload(article)
				if err != nil {
					log.Printf("skip %s/%s/%s: %v", serieSlug, chapterSlug, postSlug, err)
					continue
				}

				input.SeriesSlug = serieSlug
				input.Chapter = chapterSlug
				input.Slug = postSlug
				if sortOrder, ok := metaIDs[postSlug]; ok {
					input.SortOrder = sortOrder
				}
				if input.SortOrder <= 0 {
					next, _ := store.NextArticleSortOrder(serieSlug, chapterSlug)
					input.SortOrder = next
				}

				sermonPath := filepath.Join(chapterPath, postSlug, "sermon.mp3")
				if _, err := os.Stat(sermonPath); err == nil {
					input.SermonURL = fmt.Sprintf("/data/series/%s/%s/%s/sermon.mp3", serieSlug, chapterSlug, postSlug)
				}

				if _, _, err := store.SaveArticle(input); err != nil {
					log.Fatalf("save article %s/%s/%s: %v", serieSlug, chapterSlug, postSlug, err)
				}
				importedArticles++
			}
		}
	}

	fmt.Printf("import complete: %d hubs, %d articles -> %s\n", importedHubs, importedArticles, *dbPath)
}

func readJSONFile(path string) (map[string]any, bool) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, false
	}
	var parsed map[string]any
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, false
	}
	return parsed, true
}

func isArticleData(data map[string]any) bool {
	title, _ := data["title"].(string)
	sections, _ := data["sections"].([]any)
	return strings.TrimSpace(title) != "" && len(sections) > 0
}

func isHubData(data map[string]any) bool {
	posts, _ := data["posts"].([]any)
	if len(posts) == 0 {
		return false
	}
	_, hasTitle := data["title"].(string)
	sections, _ := data["sections"].([]any)
	return !hasTitle || len(sections) == 0
}

func readHubPostIDs(path string) map[string]int {
	data, ok := readJSONFile(path)
	if !ok {
		return map[string]int{}
	}
	posts, _ := data["posts"].([]any)
	out := map[string]int{}
	for _, item := range posts {
		post, ok := item.(map[string]any)
		if !ok {
			continue
		}
		name := strings.TrimSpace(fmt.Sprint(post["name"]))
		if name == "" {
			continue
		}
		switch id := post["id"].(type) {
		case float64:
			out[name] = int(id)
		case int:
			out[name] = id
		}
	}
	return out
}
