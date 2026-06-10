package dynamo

import (
	"fmt"
	"strings"
)

const (
	skProfile      = "PROFILE"
	skRefresh      = "REFRESH#"
	skTokenMeta    = "META"
	gsiEmail       = "email_index"
	gsiTokenHash   = "token_hash_index"
	tokenTypeEmail = "email_verify"
	tokenTypeReset = "password_reset"
)

func userPK(id string) string {
	return "USER#" + strings.TrimSpace(id)
}

func refreshSK(tokenID string) string {
	return skRefresh + strings.TrimSpace(tokenID)
}

func tokenPK(hash string) string {
	return "TOKEN#" + strings.TrimSpace(hash)
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func emailGSI(email string) string {
	return normalizeEmail(email)
}

func refreshFamilyKey(userID, familyID string) string {
	return fmt.Sprintf("%s#%s", strings.TrimSpace(userID), strings.TrimSpace(familyID))
}
