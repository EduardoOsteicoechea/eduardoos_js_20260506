package dynamo

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/eduardoos/database/internal/authdata"
	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"
)

const (
	verifyTokenTTL   = 24 * time.Hour
	resetTokenTTL    = time.Hour
	refreshTokenTTL  = 7 * 24 * time.Hour
	argonMemory      = 64 * 1024
	argonIterations  = 3
	argonParallelism = 2
	argonSaltLen     = 16
	argonKeyLen      = 32
)

var (
	errUserNotFound      = errors.New("user not found")
	errInvalidCredential = errors.New("invalid credentials")
	errEmailInUse        = errors.New("email already registered")
	errInvalidToken      = errors.New("invalid or expired token")
	errRefreshReuse      = errors.New("refresh token reuse detected")
)

type userProfileItem struct {
	PK            string   `dynamodbav:"pk"`
	SK            string   `dynamodbav:"sk"`
	Email         string   `dynamodbav:"email"`
	PasswordHash  string   `dynamodbav:"password_hash"`
	DisplayName   string   `dynamodbav:"display_name"`
	Roles         []string `dynamodbav:"roles"`
	EmailVerified bool     `dynamodbav:"email_verified"`
	CreatedAt     string   `dynamodbav:"created_at"`
	UpdatedAt     string   `dynamodbav:"updated_at"`
}

type tokenLookupItem struct {
	PK        string `dynamodbav:"pk"`
	SK        string `dynamodbav:"sk"`
	TokenType string `dynamodbav:"token_type"`
	UserID    string `dynamodbav:"user_id"`
	ExpiresAt int64  `dynamodbav:"expires_at"`
}

type refreshTokenItem struct {
	PK         string `dynamodbav:"pk"`
	SK         string `dynamodbav:"sk"`
	TokenHash  string `dynamodbav:"token_hash"`
	FamilyID   string `dynamodbav:"family_id"`
	UserID     string `dynamodbav:"user_id"`
	ExpiresAt  int64  `dynamodbav:"expires_at"`
	CreatedAt  string `dynamodbav:"created_at"`
	ReplacedBy string `dynamodbav:"replaced_by,omitempty"`
	RevokedAt  string `dynamodbav:"revoked_at,omitempty"`
}

func (s *Store) Register(email, password, displayName string) (authdata.User, string, error) {
	email = normalizeEmail(email)
	if email == "" || strings.TrimSpace(password) == "" {
		return authdata.User{}, "", fmt.Errorf("email and password are required")
	}

	if _, err := s.getUserByEmail(email); err == nil {
		return authdata.User{}, "", errEmailInUse
	} else if !errors.Is(err, errUserNotFound) {
		return authdata.User{}, "", err
	}

	userID := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	hash, err := hashPassword(password)
	if err != nil {
		return authdata.User{}, "", err
	}

	item := userProfileItem{
		PK:            userPK(userID),
		SK:            skProfile,
		Email:         email,
		PasswordHash:  hash,
		DisplayName:   strings.TrimSpace(displayName),
		Roles:         []string{authdata.RoleUser},
		EmailVerified: false,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return authdata.User{}, "", err
	}

	_, err = s.client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName:           aws.String(s.usersTable),
		Item:                av,
		ConditionExpression: aws.String("attribute_not_exists(pk)"),
	})
	if err != nil {
		return authdata.User{}, "", err
	}

	token, err := s.createOneTimeToken(userID, tokenTypeEmail, verifyTokenTTL)
	if err != nil {
		return authdata.User{}, "", err
	}

	return profileToUser(item), token, nil
}

func (s *Store) Login(email, password string) (authdata.User, error) {
	item, err := s.getUserByEmail(normalizeEmail(email))
	if err != nil {
		if errors.Is(err, errUserNotFound) {
			return authdata.User{}, errInvalidCredential
		}
		return authdata.User{}, err
	}

	if !verifyPassword(password, item.PasswordHash) {
		return authdata.User{}, errInvalidCredential
	}

	return profileToUser(item), nil
}

func (s *Store) GetUserByID(id string) (authdata.User, error) {
	item, err := s.getUserProfile(strings.TrimSpace(id))
	if err != nil {
		return authdata.User{}, err
	}
	return profileToUser(item), nil
}

func (s *Store) UpdateProfile(id string, displayName *string, password *string) (authdata.User, error) {
	item, err := s.getUserProfile(id)
	if err != nil {
		return authdata.User{}, err
	}

	now := time.Now().UTC().Format(time.RFC3339)
	updates := []string{"updated_at = :updated_at"}
	values := map[string]types.AttributeValue{
		":updated_at": &types.AttributeValueMemberS{Value: now},
	}

	if displayName != nil {
		item.DisplayName = strings.TrimSpace(*displayName)
		updates = append(updates, "display_name = :display_name")
		values[":display_name"] = &types.AttributeValueMemberS{Value: item.DisplayName}
	}

	if password != nil && strings.TrimSpace(*password) != "" {
		hash, hashErr := hashPassword(*password)
		if hashErr != nil {
			return authdata.User{}, hashErr
		}
		item.PasswordHash = hash
		updates = append(updates, "password_hash = :password_hash")
		values[":password_hash"] = &types.AttributeValueMemberS{Value: hash}
	}

	_, err = s.client.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String(s.usersTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: userPK(id)},
			"sk": &types.AttributeValueMemberS{Value: skProfile},
		},
		UpdateExpression:          aws.String("SET " + strings.Join(updates, ", ")),
		ExpressionAttributeValues: values,
	})
	if err != nil {
		return authdata.User{}, err
	}

	item.UpdatedAt = now
	return profileToUser(item), nil
}

func (s *Store) VerifyEmail(token string) (authdata.User, error) {
	userID, tokenType, err := s.consumeOneTimeToken(token)
	if err != nil {
		return authdata.User{}, err
	}
	if tokenType != tokenTypeEmail {
		return authdata.User{}, errInvalidToken
	}

	now := time.Now().UTC().Format(time.RFC3339)
	_, err = s.client.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String(s.usersTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: userPK(userID)},
			"sk": &types.AttributeValueMemberS{Value: skProfile},
		},
		UpdateExpression: aws.String("SET email_verified = :verified, updated_at = :updated_at"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":verified":   &types.AttributeValueMemberBOOL{Value: true},
			":updated_at": &types.AttributeValueMemberS{Value: now},
		},
	})
	if err != nil {
		return authdata.User{}, err
	}

	return s.GetUserByID(userID)
}

func (s *Store) ResendVerification(email string) (string, error) {
	item, err := s.getUserByEmail(normalizeEmail(email))
	if err != nil {
		if errors.Is(err, errUserNotFound) {
			return "", nil
		}
		return "", err
	}
	if item.EmailVerified {
		return "", nil
	}

	userID := strings.TrimPrefix(item.PK, "USER#")
	return s.createOneTimeToken(userID, tokenTypeEmail, verifyTokenTTL)
}

func (s *Store) CreatePasswordReset(email string) (string, error) {
	item, err := s.getUserByEmail(normalizeEmail(email))
	if err != nil {
		if errors.Is(err, errUserNotFound) {
			return "", nil
		}
		return "", err
	}

	userID := strings.TrimPrefix(item.PK, "USER#")
	return s.createOneTimeToken(userID, tokenTypeReset, resetTokenTTL)
}

func (s *Store) ResetPassword(token, newPassword string) (authdata.User, error) {
	if strings.TrimSpace(newPassword) == "" {
		return authdata.User{}, fmt.Errorf("password is required")
	}

	userID, tokenType, err := s.consumeOneTimeToken(token)
	if err != nil {
		return authdata.User{}, err
	}
	if tokenType != tokenTypeReset {
		return authdata.User{}, errInvalidToken
	}

	password := newPassword
	user, err := s.UpdateProfile(userID, nil, &password)
	if err != nil {
		return authdata.User{}, err
	}

	_ = s.RevokeAllRefreshTokens(userID)
	return user, nil
}

func (s *Store) IssueRefresh(userID, familyID string) (authdata.RefreshResult, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return authdata.RefreshResult{}, fmt.Errorf("user_id is required")
	}

	if familyID == "" {
		familyID = uuid.NewString()
	}

	raw, tokenID, _, expiresAt, err := s.newRefreshToken(userID, familyID)
	if err != nil {
		return authdata.RefreshResult{}, err
	}

	return authdata.RefreshResult{
		UserID:    userID,
		RawToken:  raw,
		TokenID:   tokenID,
		FamilyID:  familyID,
		ExpiresAt: expiresAt,
	}, nil
}

func (s *Store) RotateRefresh(rawToken, familyID string) (authdata.RotateResult, error) {
	item, err := s.lookupRefreshToken(rawToken)
	if err != nil {
		return authdata.RotateResult{}, err
	}

	if familyID != "" && item.FamilyID != familyID {
		return authdata.RotateResult{}, errInvalidToken
	}

	now := time.Now().UTC()
	if item.ExpiresAt > 0 && now.Unix() > item.ExpiresAt {
		return authdata.RotateResult{}, errInvalidToken
	}
	if item.RevokedAt != "" {
		_ = s.revokeRefreshFamily(item.UserID, item.FamilyID)
		return authdata.RotateResult{}, errRefreshReuse
	}
	if item.ReplacedBy != "" {
		_ = s.revokeRefreshFamily(item.UserID, item.FamilyID)
		return authdata.RotateResult{}, errRefreshReuse
	}

	newRaw, newTokenID, _, expiresAt, err := s.newRefreshToken(item.UserID, item.FamilyID)
	if err != nil {
		return authdata.RotateResult{}, err
	}

	_, err = s.client.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String(s.refreshTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: item.PK},
			"sk": &types.AttributeValueMemberS{Value: item.SK},
		},
		UpdateExpression: aws.String("SET replaced_by = :replaced_by"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":replaced_by": &types.AttributeValueMemberS{Value: refreshSK(newTokenID)},
		},
	})
	if err != nil {
		return authdata.RotateResult{}, err
	}

	return authdata.RotateResult{
		UserID:    item.UserID,
		RawToken:  newRaw,
		TokenID:   newTokenID,
		FamilyID:  item.FamilyID,
		ExpiresAt: expiresAt,
	}, nil
}

func (s *Store) RevokeRefresh(rawToken string) error {
	item, err := s.lookupRefreshToken(rawToken)
	if err != nil {
		return nil
	}

	now := time.Now().UTC().Format(time.RFC3339)
	_, err = s.client.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String(s.refreshTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: item.PK},
			"sk": &types.AttributeValueMemberS{Value: item.SK},
		},
		UpdateExpression: aws.String("SET revoked_at = :revoked_at"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":revoked_at": &types.AttributeValueMemberS{Value: now},
		},
	})
	return err
}

func (s *Store) RevokeAllRefreshTokens(userID string) error {
	return s.revokeRefreshFamily(userID, "")
}

func (s *Store) getUserProfile(userID string) (userProfileItem, error) {
	out, err := s.client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(s.usersTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: userPK(userID)},
			"sk": &types.AttributeValueMemberS{Value: skProfile},
		},
	})
	if err != nil {
		return userProfileItem{}, err
	}
	if out.Item == nil {
		return userProfileItem{}, errUserNotFound
	}

	var item userProfileItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		return userProfileItem{}, err
	}
	return item, nil
}

func (s *Store) getUserByEmail(email string) (userProfileItem, error) {
	out, err := s.client.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(s.usersTable),
		IndexName:              aws.String(gsiEmail),
		KeyConditionExpression: aws.String("email = :email"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":email": &types.AttributeValueMemberS{Value: emailGSI(email)},
		},
		Limit: aws.Int32(1),
	})
	if err != nil {
		return userProfileItem{}, err
	}
	if len(out.Items) == 0 {
		return userProfileItem{}, errUserNotFound
	}

	var item userProfileItem
	if err := attributevalue.UnmarshalMap(out.Items[0], &item); err != nil {
		return userProfileItem{}, err
	}
	return item, nil
}

func (s *Store) createOneTimeToken(userID, tokenType string, ttl time.Duration) (string, error) {
	raw, err := randomToken(32)
	if err != nil {
		return "", err
	}

	hash := hashToken(raw)
	expiresAt := time.Now().UTC().Add(ttl).Unix()

	item := tokenLookupItem{
		PK:        tokenPK(hash),
		SK:        skTokenMeta,
		TokenType: tokenType,
		UserID:    userID,
		ExpiresAt: expiresAt,
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return "", err
	}

	_, err = s.client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String(s.usersTable),
		Item:      av,
	})
	if err != nil {
		return "", err
	}

	return raw, nil
}

func (s *Store) consumeOneTimeToken(raw string) (userID, tokenType string, err error) {
	hash := hashToken(raw)
	out, err := s.client.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(s.usersTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: tokenPK(hash)},
			"sk": &types.AttributeValueMemberS{Value: skTokenMeta},
		},
	})
	if err != nil {
		return "", "", err
	}
	if out.Item == nil {
		return "", "", errInvalidToken
	}

	var item tokenLookupItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		return "", "", err
	}

	if item.ExpiresAt > 0 && time.Now().UTC().Unix() > item.ExpiresAt {
		_, _ = s.client.DeleteItem(context.Background(), &dynamodb.DeleteItemInput{
			TableName: aws.String(s.usersTable),
			Key: map[string]types.AttributeValue{
				"pk": &types.AttributeValueMemberS{Value: tokenPK(hash)},
				"sk": &types.AttributeValueMemberS{Value: skTokenMeta},
			},
		})
		return "", "", errInvalidToken
	}

	_, _ = s.client.DeleteItem(context.Background(), &dynamodb.DeleteItemInput{
		TableName: aws.String(s.usersTable),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: tokenPK(hash)},
			"sk": &types.AttributeValueMemberS{Value: skTokenMeta},
		},
	})

	return item.UserID, item.TokenType, nil
}

func (s *Store) newRefreshToken(userID, familyID string) (raw, tokenID, hash string, expiresAt int64, err error) {
	raw, err = randomToken(32)
	if err != nil {
		return "", "", "", 0, err
	}
	tokenID = uuid.NewString()
	hash = hashToken(raw)
	expiresAt = time.Now().UTC().Add(refreshTokenTTL).Unix()

	item := refreshTokenItem{
		PK:        userPK(userID),
		SK:        refreshSK(tokenID),
		TokenHash: hash,
		FamilyID:  familyID,
		UserID:    userID,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return "", "", "", 0, err
	}

	_, err = s.client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String(s.refreshTable),
		Item:      av,
	})
	if err != nil {
		return "", "", "", 0, err
	}

	return raw, tokenID, hash, expiresAt, nil
}

func (s *Store) lookupRefreshToken(raw string) (refreshTokenItem, error) {
	hash := hashToken(raw)
	out, err := s.client.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(s.refreshTable),
		IndexName:              aws.String(gsiTokenHash),
		KeyConditionExpression: aws.String("token_hash = :hash"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":hash": &types.AttributeValueMemberS{Value: hash},
		},
		Limit: aws.Int32(1),
	})
	if err != nil {
		return refreshTokenItem{}, err
	}
	if len(out.Items) == 0 {
		return refreshTokenItem{}, errInvalidToken
	}

	var item refreshTokenItem
	if err := attributevalue.UnmarshalMap(out.Items[0], &item); err != nil {
		return refreshTokenItem{}, err
	}
	return item, nil
}

func (s *Store) revokeRefreshFamily(userID, familyID string) error {
	out, err := s.client.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(s.refreshTable),
		KeyConditionExpression: aws.String("pk = :pk AND begins_with(sk, :prefix)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk":     &types.AttributeValueMemberS{Value: userPK(userID)},
			":prefix": &types.AttributeValueMemberS{Value: skRefresh},
		},
	})
	if err != nil {
		return err
	}

	now := time.Now().UTC().Format(time.RFC3339)
	for _, row := range out.Items {
		var item refreshTokenItem
		if err := attributevalue.UnmarshalMap(row, &item); err != nil {
			continue
		}
		if familyID != "" && item.FamilyID != familyID {
			continue
		}
		if item.RevokedAt != "" {
			continue
		}
		_, _ = s.client.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
			TableName: aws.String(s.refreshTable),
			Key: map[string]types.AttributeValue{
				"pk": &types.AttributeValueMemberS{Value: item.PK},
				"sk": &types.AttributeValueMemberS{Value: item.SK},
			},
			UpdateExpression: aws.String("SET revoked_at = :revoked_at"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":revoked_at": &types.AttributeValueMemberS{Value: now},
			},
		})
	}
	return nil
}

func profileToUser(item userProfileItem) authdata.User {
	id := strings.TrimPrefix(item.PK, "USER#")
	roles := item.Roles
	if len(roles) == 0 {
		roles = []string{authdata.RoleUser}
	}
	return authdata.User{
		ID:            id,
		Email:         item.Email,
		DisplayName:   item.DisplayName,
		Roles:         roles,
		EmailVerified: item.EmailVerified,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}
}

func randomToken(size int) (string, error) {
	buf := make([]byte, size)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, argonSaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	key := argon2.IDKey([]byte(password), salt, argonIterations, argonMemory, argonParallelism, argonKeyLen)
	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		argonMemory, argonIterations, argonParallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(key),
	), nil
}

func verifyPassword(password, encoded string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false
	}

	var memory uint32
	var iterations uint32
	var parallelism uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism); err != nil {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}
	expected, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false
	}

	actual := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, uint32(len(expected)))
	return subtle.ConstantTimeCompare(actual, expected) == 1
}
