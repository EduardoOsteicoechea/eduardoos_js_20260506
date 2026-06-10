package authdata

const (
	RoleAdmin  = "admin"
	RoleEditor = "editor"
	RoleUser   = "user"
)

type User struct {
	ID            string   `json:"id"`
	Email         string   `json:"email"`
	DisplayName   string   `json:"display_name"`
	Roles         []string `json:"roles"`
	EmailVerified bool     `json:"email_verified"`
	CreatedAt     string   `json:"created_at"`
	UpdatedAt     string   `json:"updated_at"`
}

type RefreshResult struct {
	UserID      string `json:"user_id"`
	RawToken    string `json:"raw_token"`
	TokenID     string `json:"token_id"`
	FamilyID    string `json:"family_id"`
	ExpiresAt   int64  `json:"expires_at"`
}

type RotateResult struct {
	UserID      string `json:"user_id"`
	RawToken    string `json:"raw_token"`
	TokenID     string `json:"token_id"`
	FamilyID    string `json:"family_id"`
	ExpiresAt   int64  `json:"expires_at"`
}
