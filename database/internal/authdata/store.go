package authdata

// Store persists users, refresh tokens, and one-time auth tokens in DynamoDB.
type Store interface {
	Register(email, password, displayName string) (User, string, error)
	Login(email, password string) (User, error)
	GetUserByID(id string) (User, error)
	UpdateProfile(id string, displayName *string, password *string) (User, error)
	VerifyEmail(token string) (User, error)
	ResendVerification(email string) (string, error)
	CreatePasswordReset(email string) (string, error)
	ResetPassword(token, newPassword string) (User, error)

	IssueRefresh(userID, familyID string) (RefreshResult, error)
	RotateRefresh(rawToken, familyID string) (RotateResult, error)
	RevokeRefresh(rawToken string) error
	RevokeAllRefreshTokens(userID string) error
}
