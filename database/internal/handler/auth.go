package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/eduardoos/database/internal/authdata"
)

type AuthAPI struct {
	Store authdata.Store
}

func (a *AuthAPI) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email       string `json:"email"`
		Password    string `json:"password"`
		DisplayName string `json:"display_name"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	user, verifyToken, err := a.Store.Register(body.Email, body.Password, body.DisplayName)
	if err != nil {
		if strings.Contains(err.Error(), "already registered") {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"ok":            true,
		"user":          user,
		"verify_token":  verifyToken,
	})
}

func (a *AuthAPI) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	user, err := a.Store.Login(body.Email, body.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "user": user})
}

func (a *AuthAPI) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.URL.Query().Get("id"))
	if userID == "" {
		writeError(w, http.StatusBadRequest, "id is required")
		return
	}

	user, err := a.Store.GetUserByID(userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "user": user})
}

func (a *AuthAPI) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID      string  `json:"user_id"`
		DisplayName *string `json:"display_name"`
		Password    *string `json:"password"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if strings.TrimSpace(body.UserID) == "" {
		writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	user, err := a.Store.UpdateProfile(body.UserID, body.DisplayName, body.Password)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "user": user})
}

func (a *AuthAPI) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token string `json:"token"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	user, err := a.Store.VerifyEmail(strings.TrimSpace(body.Token))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "user": user})
}

func (a *AuthAPI) ResendVerification(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	token, err := a.Store.ResendVerification(body.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not resend verification")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":           true,
		"verify_token": token,
	})
}

func (a *AuthAPI) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	token, err := a.Store.CreatePasswordReset(body.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create reset token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":          true,
		"reset_token": token,
	})
}

func (a *AuthAPI) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	user, err := a.Store.ResetPassword(body.Token, body.Password)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "user": user})
}

func (a *AuthAPI) IssueRefresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID   string `json:"user_id"`
		FamilyID string `json:"family_id"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	result, err := a.Store.IssueRefresh(body.UserID, body.FamilyID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "refresh": result})
}

func (a *AuthAPI) RotateRefresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		FamilyID string `json:"family_id"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	result, err := a.Store.RotateRefresh(body.Token, body.FamilyID)
	if err != nil {
		if strings.Contains(err.Error(), "reuse") {
			writeError(w, http.StatusUnauthorized, "refresh token reuse detected")
			return
		}
		writeError(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "refresh": result})
}

func (a *AuthAPI) RevokeRefresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token string `json:"token"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if err := a.Store.RevokeRefresh(body.Token); err != nil {
		writeError(w, http.StatusInternalServerError, "could not revoke refresh token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *AuthAPI) LogoutAll(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID string `json:"user_id"`
	}
	if !decodeJSONBody(r, &body) {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if err := a.Store.RevokeAllRefreshTokens(body.UserID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not revoke sessions")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func decodeJSONBody(r *http.Request, target any) bool {
	defer r.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return false
	}
	if len(strings.TrimSpace(string(raw))) == 0 {
		return false
	}
	return json.Unmarshal(raw, target) == nil
}
