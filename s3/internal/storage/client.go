package storage

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	appconfig "github.com/eduardoos/s3/internal/config"
)

type FolderEntry struct {
	Name   string `json:"name"`
	Prefix string `json:"prefix"`
}

type ObjectEntry struct {
	Key          string `json:"key"`
	Name         string `json:"name"`
	URL          string `json:"url"`
	Size         int64  `json:"size"`
	ContentType  string `json:"content_type,omitempty"`
	LastModified string `json:"last_modified"`
}

type ListResult struct {
	Prefix  string        `json:"prefix"`
	Folders []FolderEntry `json:"folders"`
	Objects []ObjectEntry `json:"objects"`
}

type UploadResult struct {
	Key         string `json:"key"`
	URL         string `json:"url"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
}

type Client struct {
	cfg    appconfig.Config
	client *s3.Client
}

func New(ctx context.Context, cfg appconfig.Config) (*Client, error) {
	if cfg.Bucket == "" {
		return nil, fmt.Errorf("S3_BUCKET is required")
	}

	awsCfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(cfg.AWSRegion))
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	return &Client{
		cfg:    cfg,
		client: s3.NewFromConfig(awsCfg),
	}, nil
}

func (c *Client) List(ctx context.Context, prefix string) (ListResult, error) {
	resolvedPrefix := c.resolvePrefix(prefix)

	output, err := c.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:    aws.String(c.cfg.Bucket),
		Prefix:    aws.String(resolvedPrefix),
		Delimiter: aws.String("/"),
	})
	if err != nil {
		return ListResult{}, err
	}

	result := ListResult{
		Prefix:  c.publicPrefix(resolvedPrefix),
		Folders: []FolderEntry{},
		Objects: []ObjectEntry{},
	}

	for _, commonPrefix := range output.CommonPrefixes {
		folderPrefix := aws.ToString(commonPrefix.Prefix)
		name := strings.TrimSuffix(strings.TrimPrefix(folderPrefix, resolvedPrefix), "/")
		if name == "" {
			continue
		}
		result.Folders = append(result.Folders, FolderEntry{
			Name:   name,
			Prefix: c.publicPrefix(folderPrefix),
		})
	}

	for _, object := range output.Contents {
		key := aws.ToString(object.Key)
		if key == "" || key == resolvedPrefix {
			continue
		}
		result.Objects = append(result.Objects, c.objectEntry(key, object))
	}

	return result, nil
}

func (c *Client) Upload(
	ctx context.Context,
	relativePrefix, filename, contentType string,
	body io.Reader,
	size int64,
) (UploadResult, error) {
	key, err := c.buildObjectKey(relativePrefix, filename)
	if err != nil {
		return UploadResult{}, err
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = c.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(c.cfg.Bucket),
		Key:           aws.String(key),
		Body:          body,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(contentType),
	})
	if err != nil {
		return UploadResult{}, err
	}

	return UploadResult{
		Key:         c.publicKey(key),
		URL:         c.objectURL(key),
		Size:        size,
		ContentType: contentType,
	}, nil
}

func (c *Client) ObjectURL(ctx context.Context, relativeKey string) (string, error) {
	key, err := c.resolveObjectKey(relativeKey)
	if err != nil {
		return "", err
	}

	head, err := c.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", err
	}
	_ = head
	return c.objectURL(key), nil
}

func (c *Client) objectEntry(key string, object types.Object) ObjectEntry {
	name := path.Base(key)
	return ObjectEntry{
		Key:          c.publicKey(key),
		Name:         name,
		URL:          c.objectURL(key),
		Size:         aws.ToInt64(object.Size),
		LastModified: object.LastModified.UTC().Format(time.RFC3339),
	}
}

func (c *Client) objectURL(key string) string {
	if c.cfg.PublicBaseURL != "" {
		return c.cfg.PublicBaseURL + "/" + c.publicKey(key)
	}
	return fmt.Sprintf(
		"https://%s.s3.%s.amazonaws.com/%s",
		c.cfg.Bucket,
		c.cfg.AWSRegion,
		c.publicKey(key),
	)
}

func (c *Client) resolvePrefix(prefix string) string {
	clean := sanitizeRelativePrefix(prefix)
	return c.cfg.RootPrefix + clean
}

func (c *Client) buildObjectKey(relativePrefix, filename string) (string, error) {
	cleanPrefix := sanitizeRelativePrefix(relativePrefix)
	cleanName := sanitizeFilename(filename)
	if cleanName == "" {
		return "", fmt.Errorf("filename is required")
	}
	return c.cfg.RootPrefix + cleanPrefix + cleanName, nil
}

func (c *Client) resolveObjectKey(relativeKey string) (string, error) {
	clean := strings.Trim(strings.TrimSpace(relativeKey), "/")
	if clean == "" {
		return "", fmt.Errorf("key is required")
	}
	if strings.Contains(clean, "..") {
		return "", fmt.Errorf("invalid key")
	}
	if c.cfg.RootPrefix != "" && strings.HasPrefix(clean, strings.TrimSuffix(c.cfg.RootPrefix, "/")) {
		return clean, nil
	}
	return c.cfg.RootPrefix + clean, nil
}

func (c *Client) publicPrefix(prefix string) string {
	if c.cfg.RootPrefix == "" {
		return prefix
	}
	return strings.TrimPrefix(prefix, c.cfg.RootPrefix)
}

func (c *Client) publicKey(key string) string {
	return c.publicPrefix(key)
}

func sanitizeRelativePrefix(prefix string) string {
	prefix = strings.TrimSpace(prefix)
	prefix = strings.Trim(prefix, "/")
	if prefix == "" {
		return ""
	}
	parts := strings.Split(prefix, "/")
	clean := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" || part == "." || part == ".." {
			continue
		}
		clean = append(clean, part)
	}
	if len(clean) == 0 {
		return ""
	}
	return strings.Join(clean, "/") + "/"
}

func sanitizeFilename(filename string) string {
	filename = strings.TrimSpace(filename)
	filename = strings.ReplaceAll(filename, "\\", "/")
	filename = path.Base(filename)
	if filename == "." || filename == ".." || filename == "/" {
		return ""
	}
	return filename
}
