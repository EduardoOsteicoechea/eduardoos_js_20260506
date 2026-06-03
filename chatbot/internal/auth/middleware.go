package auth

import (
	"net/http"
	"strings"

	"github.com/eduardoos/chatbot/internal/config"
)

const internalTokenHeader = "X-Chatbot-Internal-Token"
const sessionAuthHeader = "X-Chatbot-Session-Authorized"

func Middleware(cfg config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if cfg.InternalToken == "" {
			http.Error(w, `{"ok":false,"error":"CHATBOT_INTERNAL_TOKEN is not configured"}`, http.StatusServiceUnavailable)
			return
		}

		token := strings.TrimSpace(r.Header.Get(internalTokenHeader))
		if token == "" || token != cfg.InternalToken {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok":false,"error":"unauthorized: invalid internal token"}`))
			return
		}

		if cfg.PublicAuthEnabled {
			if strings.TrimSpace(r.Header.Get(sessionAuthHeader)) != "1" {
				w.Header().Set("Content-Type", "application/json; charset=utf-8")
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte(`{"ok":false,"error":"unauthorized: session not verified"}`))
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
