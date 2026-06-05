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

type hubPostMeta struct {
	Name string  `json:"name"`
	ID   float64 `json:"id"`
}

func main() {
	seriesRoot := flag.String("series-root", "../backend/public/data/series", "path to series data root")
	dbPath := flag.String("db", "posts.db", "sqlite database path")
	flag.Parse()

	store, err := db.Open(*dbPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer store.Close()

	entries, err := os.ReadDir(*seriesRoot)
	if err != nil {
		log.Fatalf("read series root: %v", err)
	}

	importedSeries := 0
	importedPosts := 0

	for _, serieEntry := range entries {
		if !serieEntry.IsDir() {
			continue
		}

		serieSlug := serieEntry.Name()
		seriesID, err := store.UpsertSeries(serieSlug, serieSlug)
		if err != nil {
			log.Fatalf("upsert series %s: %v", serieSlug, err)
		}
		importedSeries++

		seriePath := filepath.Join(*seriesRoot, serieSlug)
		chapterEntries, err := os.ReadDir(seriePath)
		if err != nil {
			log.Printf("skip chapters for %s: %v", serieSlug, err)
			continue
		}

		for _, chapterEntry := range chapterEntries {
			if !chapterEntry.IsDir() {
				continue
			}

			chapterSlug := chapterEntry.Name()
			chapterPath := filepath.Join(seriePath, chapterSlug)
			metaIDs := readHubPostIDs(filepath.Join(chapterPath, "data.json"))

			postEntries, err := os.ReadDir(chapterPath)
			if err != nil {
				continue
			}

			for _, postEntry := range postEntries {
				if !postEntry.IsDir() {
					continue
				}

				postSlug := postEntry.Name()
				dataPath := filepath.Join(chapterPath, postSlug, "data.json")
				title, author := readArticleMeta(dataPath, postSlug)

				sortOrder := 0
				if id, ok := metaIDs[postSlug]; ok {
					sortOrder = id
				}

				if err := store.UpsertPost(seriesID, chapterSlug, postSlug, title, author, sortOrder); err != nil {
					log.Fatalf("upsert post %s/%s/%s: %v", serieSlug, chapterSlug, postSlug, err)
				}
				importedPosts++
			}
		}
	}

	fmt.Printf("import complete: %d series, %d posts -> %s\n", importedSeries, importedPosts, *dbPath)
}

func readHubPostIDs(path string) map[string]int {
	raw, err := os.ReadFile(path)
	if err != nil {
		return map[string]int{}
	}

	var parsed struct {
		Posts []hubPostMeta `json:"posts"`
	}
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return map[string]int{}
	}

	out := make(map[string]int)
	for _, post := range parsed.Posts {
		name := strings.TrimSpace(post.Name)
		if name == "" {
			continue
		}
		out[name] = int(post.ID)
	}
	return out
}

func readArticleMeta(path, fallbackSlug string) (title, author string) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return fallbackSlug, ""
	}

	var parsed map[string]any
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return fallbackSlug, ""
	}

	title = strings.TrimSpace(fmt.Sprint(parsed["title"]))
	if title == "" {
		title = fallbackSlug
	}
	author = strings.TrimSpace(fmt.Sprint(parsed["creator"]))
	return title, author
}
