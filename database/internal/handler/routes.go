package handler

import (
	"net/http"

	"github.com/eduardoos/database/internal/auth"
	"github.com/eduardoos/database/internal/config"
	"github.com/eduardoos/database/internal/db"
)

func Register(mux *http.ServeMux, cfg config.Config, store *db.Store) {
	api := &API{Store: store}

	mux.HandleFunc("GET /health", Health)

	registerProtected := func(pattern string, handler http.HandlerFunc) {
		mux.Handle(pattern, auth.Middleware(cfg, handler))
	}

	registerProtected("GET /catalog", api.Catalog)
	registerProtected("GET /series", api.ListSeries)
	registerProtected("GET /posts", api.ListPosts)
	registerProtected("GET /post", api.GetPost)
	registerProtected("GET /article", api.GetArticle)
	registerProtected("GET /hub", api.GetHub)
	registerProtected("GET /discover", api.Discover)
	registerProtected("GET /posts/next-id", api.NextArticleID)
	registerProtected("POST /article/save", api.SaveArticle)
}
