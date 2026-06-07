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

type ObjectBody struct {
	Body        io.ReadCloser
	ContentType string
	Size        int64
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

func (c *Client) List(ctx context.Context, _ string) (ListResult, error) {
	// All media objects live flat under S3_ROOT_PREFIX (e.g. media/).
	// Post/series grouping is stored in posts-db, not as S3 folders.
	resolvedPrefix := c.cfg.RootPrefix

	output, err := c.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(c.cfg.Bucket),
		Prefix: aws.String(resolvedPrefix),
	})
	if err != nil {
		return ListResult{}, err
	}

	result := ListResult{
		Prefix:  c.publicPrefix(resolvedPrefix),
		Folders: []FolderEntry{},
		Objects: []ObjectEntry{},
	}

	for _, object := range output.Contents {
		key := aws.ToString(object.Key)
		if key == "" || key == resolvedPrefix || !c.isFlatMediaKey(key) {
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

func (c *Client) OpenObject(ctx context.Context, relativeKey string) (ObjectBody, error) {
	key, err := c.resolveObjectKey(relativeKey)
	if err != nil {
		return ObjectBody{}, err
	}

	output, err := c.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return ObjectBody{}, err
	}

	contentType := aws.ToString(output.ContentType)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return ObjectBody{
		Body:        output.Body,
		ContentType: contentType,
		Size:        aws.ToInt64(output.ContentLength),
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
		base := strings.TrimRight(c.cfg.PublicBaseURL, "/")
		root := strings.Trim(strings.TrimSuffix(c.cfg.RootPrefix, "/"), "/")
		if root != "" && strings.HasSuffix(base, "/"+root) {
			return base + "/" + strings.TrimPrefix(c.publicKey(key), "/")
		}
		return base + "/" + strings.TrimPrefix(key, "/")
	}
	return fmt.Sprintf(
		"https://%s.s3.%s.amazonaws.com/%s",
		c.cfg.Bucket,
		c.cfg.AWSRegion,
		key,
	)
}

func (c *Client) resolvePrefix(prefix string) string {
	clean := sanitizeRelativePrefix(prefix)
	return c.cfg.RootPrefix + clean
}

func (c *Client) buildObjectKey(_ string, filename string) (string, error) {
	cleanName := sanitizeFilename(filename)
	if cleanName == "" {
		return "", fmt.Errorf("filename is required")
	}
	// Unique flat key under media/ — series/post association lives in posts-db.
	storedName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), cleanName)
	return c.cfg.RootPrefix + storedName, nil
}

func (c *Client) isFlatMediaKey(key string) bool {
	relative := strings.TrimPrefix(key, c.cfg.RootPrefix)
	relative = strings.Trim(strings.TrimPrefix(relative, "/"), "/")
	return relative != "" && !strings.Contains(relative, "/")
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
