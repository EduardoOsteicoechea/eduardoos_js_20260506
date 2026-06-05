package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/eduardoos/database/internal/db"
)

type API struct {
	Store *db.Store
}

func (a *API) Catalog(w http.ResponseWriter, _ *http.Request) {
	catalog, err := a.Store.BuildCatalog()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load catalog")
		return
	}
	writeJSON(w, http.StatusOK, catalog)
}

func (a *API) ListSeries(w http.ResponseWriter, _ *http.Request) {
	series, err := a.Store.ListSeries()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load series")
		return
	}
	if series == nil {
		series = []db.Series{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"series": series})
}

func (a *API) ListPosts(w http.ResponseWriter, r *http.Request) {
	seriesSlug := strings.TrimSpace(r.URL.Query().Get("series"))
	chapter := strings.TrimSpace(r.URL.Query().Get("chapter"))
	if seriesSlug == "" || chapter == "" {
		writeError(w, http.StatusBadRequest, "series and chapter are required")
		return
	}

	articles, err := a.Store.ListPosts(seriesSlug, chapter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load posts")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"articles": articles})
}

func (a *API) GetPost(w http.ResponseWriter, r *http.Request) {
	rawID := strings.TrimSpace(r.URL.Query().Get("id"))
	if rawID == "" {
		writeError(w, http.StatusBadRequest, "id is required")
		return
	}

	id, err := strconv.ParseInt(rawID, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	post, err := a.Store.GetPostByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not load post")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"post": post})
}
