const S3_HOST_PATTERN = /\.s3[.-][a-z0-9-]+\.amazonaws\.com$/i;

function extractS3ObjectKey(value) {
  try {
    const url = new URL(value);
    if (!S3_HOST_PATTERN.test(url.hostname)) return null;
    const path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (path.startsWith('media/')) {
      return path.slice('media/'.length);
    }
    return path;
  } catch {
    return null;
  }
}

function buildProxyUrl(key) {
  const clean = String(key ?? '').trim().replace(/^\/+/, '');
  if (!clean) return '';
  return `/api/media/object?key=${encodeURIComponent(clean)}`;
}

/**
 * Resolve media src to a URL the browser can load through the backend proxy.
 * S3 stays private; nginx routes /api/* to the backend.
 */
export function resolveMediaUrl(src) {
  const value = String(src ?? '').trim();
  if (!value) return '';

  if (value.startsWith('/api/media/object?')) {
    return value;
  }

  if (
    value.startsWith('blob:') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    const s3Key = extractS3ObjectKey(value);
    return s3Key ? buildProxyUrl(s3Key) : value;
  }

  return buildProxyUrl(value);
}
