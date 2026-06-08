package dynamo

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/eduardoos/database/internal/config"
)

type Store struct {
	client       *dynamodb.Client
	catalogTable string
	postsTable   string
}

func Open(cfg config.Config) (*Store, error) {
	if cfg.DynamoCatalogTable == "" || cfg.DynamoPostsTable == "" {
		return nil, fmt.Errorf("DYNAMODB_CATALOG_TABLE and DYNAMODB_POSTS_TABLE are required")
	}

	loadOpts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.AWSRegion),
	}
	if cfg.DynamoEndpoint != "" {
		loadOpts = append(loadOpts, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider("local", "local", ""),
		))
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(), loadOpts...)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	clientOpts := []func(*dynamodb.Options){}
	if cfg.DynamoEndpoint != "" {
		endpoint := cfg.DynamoEndpoint
		clientOpts = append(clientOpts, func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String(endpoint)
		})
	}

	return &Store{
		client:       dynamodb.NewFromConfig(awsCfg, clientOpts...),
		catalogTable: cfg.DynamoCatalogTable,
		postsTable:   cfg.DynamoPostsTable,
	}, nil
}

func (s *Store) Close() error {
	return nil
}
