package config

import (
	"os"
	"strings"
)

type Config struct {
	Port          string
	BindHost      string
	InternalToken string

	// DATA_STORE selects the persistence backend: dynamodb (default) or sqlite.
	DataStore string

	// SQLite (DATA_STORE=sqlite only)
	DBPath string

	// DynamoDB (DATA_STORE=dynamodb)
	AWSRegion                string
	DynamoEndpoint           string
	DynamoCatalogTable       string
	DynamoPostsTable         string
	DynamoUsersTable         string
	DynamoRefreshTokensTable string
}

func Load() Config {
	dataStore := strings.ToLower(envOr("DATA_STORE", "dynamodb"))
	return Config{
		Port:          envOr("PORT", "8120"),
		BindHost:      envOr("BIND_HOST", "127.0.0.1"),
		InternalToken: strings.TrimSpace(os.Getenv("POSTS_DB_INTERNAL_TOKEN")),
		DataStore:     dataStore,
		DBPath:        envOr("DB_PATH", "posts.db"),

		AWSRegion:                envOr("AWS_REGION", "us-east-1"),
		DynamoEndpoint:           strings.TrimSpace(os.Getenv("DYNAMODB_ENDPOINT")),
		DynamoCatalogTable:       envOr("DYNAMODB_CATALOG_TABLE", "eduardoos_catalog"),
		DynamoPostsTable:         envOr("DYNAMODB_POSTS_TABLE", "eduardoos_posts"),
		DynamoUsersTable:         envOr("DYNAMODB_USERS_TABLE", "eduardoos_users"),
		DynamoRefreshTokensTable: envOr("DYNAMODB_REFRESH_TOKENS_TABLE", "eduardoos_refresh_tokens"),
	}
}

func (c Config) Addr() string {
	return c.BindHost + ":" + c.Port
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
