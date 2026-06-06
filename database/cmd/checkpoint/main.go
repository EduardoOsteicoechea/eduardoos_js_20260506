package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

func main() {
	source := "posts.db"
	target := "posts.db.export"
	if len(os.Args) > 1 {
		target = os.Args[1]
	}
	if len(os.Args) > 2 {
		source = os.Args[2]
	}

	if err := exportSQLite(source, target); err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("sqlite", fmt.Sprintf("file:%s", filepath.ToSlash(target)))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT slug, title FROM posts WHERE chapter = 'pablo' ORDER BY slug")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var slug, title string
		if err := rows.Scan(&slug, &title); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s\t%s\n", slug, title)
	}
}

func exportSQLite(source, target string) error {
	if err := os.Remove(target); err != nil && !os.IsNotExist(err) {
		return err
	}

	sourceURI := fmt.Sprintf("file:%s?mode=ro&_pragma=busy_timeout(10000)", filepath.ToSlash(source))
	db, err := sql.Open("sqlite", sourceURI)
	if err != nil {
		return err
	}
	defer db.Close()

	targetPath := filepath.ToSlash(target)
	if _, err := db.Exec(fmt.Sprintf("VACUUM INTO '%s'", targetPath)); err != nil {
		return err
	}
	return nil
}
