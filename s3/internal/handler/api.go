package handler

import (
	"io"
	"net/http"
	"strings"

	"github.com/eduardoos/s3/internal/storage"
)

type API struct {
	Store          *storage.Client
	MaxUploadBytes int64
}

func (a *API) List(w http.ResponseWriter, r *http.Request) {
	prefix := strings.TrimSpace(r.URL.Query().Get("prefix"))
	result, err := a.Store.List(r.Context(), prefix)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list s3 objects")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"prefix":  result.Prefix,
		"folders": result.Folders,
		"objects": result.Objects,
	})
}

func (a *API) URL(w http.ResponseWriter, r *http.Request) {
	key := strings.TrimSpace(r.URL.Query().Get("key"))
	if key == "" {
		writeError(w, http.StatusBadRequest, "key is required")
		return
	}

	url, err := a.Store.ObjectURL(r.Context(), key)
	if err != nil {
		writeError(w, http.StatusNotFound, "object not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":  true,
		"key": key,
		"url": url,
	})
}

func (a *API) Upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(64 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	prefix := strings.TrimSpace(r.FormValue("prefix"))
	contentType := strings.TrimSpace(header.Header.Get("Content-Type"))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	limit := a.MaxUploadBytes
	if limit <= 0 {
		limit = 52 << 20
	}

	result, err := a.Store.Upload(
		r.Context(),
		prefix,
		header.Filename,
		contentType,
		io.LimitReader(file, limit),
		header.Size,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not upload file")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":           true,
		"key":          result.Key,
		"url":          result.URL,
		"size":         result.Size,
		"content_type": result.ContentType,
	})
}
