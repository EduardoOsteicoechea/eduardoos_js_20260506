package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	BindHost       string
	InternalToken  string
	AWSRegion      string
	Bucket         string
	RootPrefix     string
	PublicBaseURL  string
	MaxUploadBytes int64
}

func Load() Config {
	maxUpload := int64(52_428_800) // 50 MiB
	if v := strings.TrimSpace(os.Getenv("S3_MAX_UPLOAD_BYTES")); v != "" {
		if parsed, err := parseInt64(v); err == nil && parsed > 0 {
			maxUpload = parsed
		}
	}

	return Config{
		Port:           envOr("PORT", "8130"),
		BindHost:       envOr("BIND_HOST", "127.0.0.1"),
		InternalToken:  strings.TrimSpace(os.Getenv("S3_INTERNAL_TOKEN")),
		AWSRegion:      envOr("AWS_REGION", "us-east-1"),
		Bucket:         strings.TrimSpace(os.Getenv("S3_BUCKET")),
		RootPrefix:     normalizePrefix(envOr("S3_ROOT_PREFIX", "media")),
		PublicBaseURL:  strings.TrimRight(strings.TrimSpace(os.Getenv("S3_PUBLIC_BASE_URL")), "/"),
		MaxUploadBytes: maxUpload,
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

func normalizePrefix(value string) string {
	value = strings.Trim(value, "/")
	if value == "" {
		return ""
	}
	return value + "/"
}

func parseInt64(value string) (int64, error) {
	var out int64
	for _, ch := range value {
		if ch < '0' || ch > '9' {
			return 0, os.ErrInvalid
		}
		out = out*10 + int64(ch-'0')
	}
	return out, nil
}
