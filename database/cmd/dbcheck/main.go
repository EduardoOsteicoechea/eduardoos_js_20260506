package main

import (
	"fmt"
	"log"

	"github.com/eduardoos/database/internal/db"
)

func main() {
	store, err := db.Open("posts.db")
	if err != nil {
		log.Fatal(err)
	}
	defer store.Close()

	article, _, err := store.GetArticle("romanos", "pablo", "origen")
	fmt.Println("err", err, "sections", len(article["sections"].([]map[string]any)))

	discover, err := store.BuildDiscover()
	fmt.Println("discover err", err, "articles", len(discover.Articles))
}
