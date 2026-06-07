package db

type Series struct {
	ID        int64  `json:"id"`
	Slug      string `json:"slug"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type Post struct {
	ID         int64  `json:"id"`
	SeriesID   int64  `json:"series_id"`
	SeriesSlug string `json:"series_slug,omitempty"`
	Chapter    string `json:"chapter"`
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	Author     string `json:"author,omitempty"`
	SortOrder  int    `json:"sort_order"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type SeriesMeta struct {
	Name string `json:"name"`
}

type Catalog struct {
	Series     []string               `json:"series"`
	SeriesMeta map[string]SeriesMeta  `json:"series_meta"`
	Chapters   map[string][]string    `json:"chapters"`
}

type ArticleOption struct {
	ID        *int   `json:"id,omitempty"`
	ArticleID string `json:"article_id"`
	Title     string `json:"title"`
}
