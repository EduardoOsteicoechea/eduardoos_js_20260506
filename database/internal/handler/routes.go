package handler

import (
	"net/http"

	"github.com/eduardoos/database/internal/auth"
	"github.com/eduardoos/database/internal/authdata"
	"github.com/eduardoos/database/internal/config"
	"github.com/eduardoos/database/internal/db"
)

func Register(mux *http.ServeMux, cfg config.Config, store db.DataStore) {
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
	registerProtected("POST /catalog/save", api.SaveCatalog)
	registerProtected("POST /logs", api.AppendLogs)
	registerProtected("GET /logs", api.QueryLogs)
}

func RegisterAuth(mux *http.ServeMux, cfg config.Config, store authdata.Store) {
	authAPI := &AuthAPI{Store: store}

	registerProtected := func(pattern string, handler http.HandlerFunc) {
		mux.Handle(pattern, auth.Middleware(cfg, handler))
	}

	registerProtected("POST /auth/register", authAPI.Register)
	registerProtected("POST /auth/login", authAPI.Login)
	registerProtected("GET /auth/user", authAPI.GetUser)
	registerProtected("PATCH /auth/profile", authAPI.UpdateProfile)
	registerProtected("POST /auth/verify-email", authAPI.VerifyEmail)
	registerProtected("POST /auth/resend-verification", authAPI.ResendVerification)
	registerProtected("POST /auth/forgot-password", authAPI.ForgotPassword)
	registerProtected("POST /auth/reset-password", authAPI.ResetPassword)
	registerProtected("POST /auth/refresh/issue", authAPI.IssueRefresh)
	registerProtected("POST /auth/refresh/rotate", authAPI.RotateRefresh)
	registerProtected("POST /auth/refresh/revoke", authAPI.RevokeRefresh)
	registerProtected("POST /auth/logout-all", authAPI.LogoutAll)
}
