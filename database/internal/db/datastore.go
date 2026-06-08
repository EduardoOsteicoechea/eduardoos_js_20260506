package db

// DataStore is the persistence layer used by the posts-db HTTP API.
type DataStore interface {
	Close() error

	BuildCatalog() (Catalog, error)
	ListSeries() ([]Series, error)
	ListPosts(seriesSlug, chapter string) ([]ArticleOption, error)
	GetPostByID(id int64) (Post, error)
	GetArticle(seriesSlug, chapter, slug string) (map[string]any, string, error)
	GetHub(seriesSlug, chapter string) (map[string]any, error)
	BuildDiscover() (DiscoverPayload, error)
	NextArticleSortOrder(seriesSlug, chapter string) (int, error)
	GetPostID(seriesSlug, chapter, slug string) (int64, error)
	SaveArticle(input SaveArticleInput) (int64, int, error)
	SaveCatalogEntry(seriesSlug, seriesName, chapter string, hub map[string]any) error

	AppendLog(input AppendLogInput) (int64, error)
	AppendLogs(inputs []AppendLogInput) (int, error)
	ListLogs(query ListLogsQuery) ([]ServiceLog, error)
	CountLogs() (int64, error)
}
