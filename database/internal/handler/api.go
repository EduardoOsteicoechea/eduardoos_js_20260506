package handler

import (
	"encoding/json"
	"io"
	"log"
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

func (a *API) GetArticle(w http.ResponseWriter, r *http.Request) {
	seriesSlug := strings.TrimSpace(r.URL.Query().Get("series"))
	chapter := strings.TrimSpace(r.URL.Query().Get("chapter"))
	slug := strings.TrimSpace(r.URL.Query().Get("slug"))
	if seriesSlug == "" {
		seriesSlug = strings.TrimSpace(r.URL.Query().Get("serie"))
	}
	if slug == "" {
		slug = strings.TrimSpace(r.URL.Query().Get("article_id"))
	}
	if seriesSlug == "" || chapter == "" || slug == "" {
		writeError(w, http.StatusBadRequest, "series, chapter and slug are required")
		return
	}

	article, sermonURL, err := a.Store.GetArticle(seriesSlug, chapter, slug)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "article not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not load article")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"article":    article,
		"sermon_url": sermonURL,
	})
}

func (a *API) GetHub(w http.ResponseWriter, r *http.Request) {
	seriesSlug := strings.TrimSpace(r.URL.Query().Get("series"))
	chapter := strings.TrimSpace(r.URL.Query().Get("chapter"))
	if seriesSlug == "" || chapter == "" {
		writeError(w, http.StatusBadRequest, "series and chapter are required")
		return
	}

	hub, err := a.Store.GetHub(seriesSlug, chapter)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "hub not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not load hub")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"hub": hub})
}

func (a *API) Discover(w http.ResponseWriter, _ *http.Request) {
	payload, err := a.Store.BuildDiscover()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not build discover payload")
		return
	}
	writeJSON(w, http.StatusOK, payload)
}

func (a *API) NextArticleID(w http.ResponseWriter, r *http.Request) {
	seriesSlug := strings.TrimSpace(r.URL.Query().Get("series"))
	chapter := strings.TrimSpace(r.URL.Query().Get("chapter"))
	if seriesSlug == "" {
		seriesSlug = strings.TrimSpace(r.URL.Query().Get("serie"))
	}
	if seriesSlug == "" || chapter == "" {
		writeError(w, http.StatusBadRequest, "series and chapter are required")
		return
	}

	next, err := a.Store.NextArticleSortOrder(seriesSlug, chapter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not assign next id")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"article_id": strconv.Itoa(next),
		"slug":       strings.Join([]string{seriesSlug, chapter, strconv.Itoa(next)}, "/"),
	})
}

func (a *API) SaveArticle(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 8<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var raw map[string]any
	if err := json.Unmarshal(body, &raw); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	input, err := db.ParseSaveArticlePayload(raw)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if input.SortOrder <= 0 {
		existingOrder := 0
		if postID, lookupErr := a.Store.GetPostID(input.SeriesSlug, input.Chapter, input.Slug); lookupErr == nil {
			post, postErr := a.Store.GetPostByID(postID)
			if postErr == nil {
				existingOrder = post.SortOrder
			}
		}
		if existingOrder > 0 {
			input.SortOrder = existingOrder
		} else if requested := strings.TrimSpace(fmtAny(raw["article_id"])); requested != "" {
			if parsed, parseErr := strconv.Atoi(requested); parseErr == nil && parsed > 0 {
				input.SortOrder = parsed
			}
		}
		if input.SortOrder <= 0 {
			next, nextErr := a.Store.NextArticleSortOrder(input.SeriesSlug, input.Chapter)
			if nextErr != nil {
				writeError(w, http.StatusInternalServerError, "could not assign sort order")
				return
			}
			input.SortOrder = next
		}
	}

	if sermon := strings.TrimSpace(fmtAny(raw["sermon_url"])); sermon != "" {
		input.SermonURL = sermon
	}

	postID, sortOrder, err := a.Store.SaveArticle(input)
	if err != nil {
		log.Printf("[posts-db] save article: %v", err)
		writeError(w, http.StatusInternalServerError, "could not save article")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                 true,
		"post_id":            postID,
		"section_article_id": sortOrder,
		"path":               strings.Join([]string{input.SeriesSlug, input.Chapter, input.Slug}, "/"),
	})
}

func (a *API) SaveCatalog(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 2<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var raw map[string]any
	if err := json.Unmarshal(body, &raw); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	seriesSlug := strings.TrimSpace(fmtAny(raw["series_slug"]))
	if seriesSlug == "" {
		seriesSlug = strings.TrimSpace(fmtAny(raw["serie"]))
	}
	seriesName := strings.TrimSpace(fmtAny(raw["series_name"]))
	chapter := strings.TrimSpace(fmtAny(raw["chapter"]))

	var hub map[string]any
	if hubRaw, ok := raw["hub"].(map[string]any); ok && hubRaw != nil {
		hub = hubRaw
	}

	if seriesSlug == "" {
		writeError(w, http.StatusBadRequest, "series_slug is required")
		return
	}

	if err := a.Store.SaveCatalogEntry(seriesSlug, seriesName, chapter, hub); err != nil {
		log.Printf("[posts-db] save catalog: %v", err)
		writeError(w, http.StatusInternalServerError, "could not save catalog metadata")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":          true,
		"series_slug": seriesSlug,
		"chapter":     chapter,
	})
}

func fmtAny(value any) string {
	if value == nil {
		return ""
	}
	if typed, ok := value.(string); ok {
		return typed
	}
	return strings.TrimSpace(string(mustJSON(value)))
}

func mustJSON(value any) []byte {
	raw, _ := json.Marshal(value)
	return raw
}
