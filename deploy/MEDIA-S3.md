# S3 media access (default: private)

Keep **Block all public access = ON** on `eduardoos20260607`.

Files are served through the backend:

- `GET /api/media/object?key=series/romanos/pablo/photo.jpg`
- nginx proxies `/api/*` → backend → s3api → private S3

Do **not** apply `s3-public-read-policy.json` unless you intentionally want direct public S3 URLs (no backend proxy).
