package auth

import (
	"net/http"
	"strings"

	"github.com/eduardoos/s3/internal/config"
)

const internalTokenHeader = "X-S3-Internal-Token"

func Middleware(cfg config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if cfg.InternalToken == "" {
			http.Error(
				w,
				`{"ok":false,"error":"S3_INTERNAL_TOKEN is not configured"}`,
				http.StatusServiceUnavailable,
			)
			return
		}

		token := strings.TrimSpace(r.Header.Get(internalTokenHeader))
		if token == "" || token != cfg.InternalToken {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok":false,"error":"unauthorized"}`))
			return
		}

		next.ServeHTTP(w, r)
	})
}
