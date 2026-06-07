const PUBLIC_MEDIA_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_MEDIA_BASE_URL
    ? String(import.meta.env.PUBLIC_MEDIA_BASE_URL).replace(/\/+$/g, '')
    : '';

/**
 * Resolve article/editor media src to a browser-loadable URL.
 * Supports full URLs, site paths, and S3 keys stored without the public base.
 */
export function resolveMediaUrl(src) {
  const value = String(src ?? '').trim();
  if (!value) return '';

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value;
  }

  if (PUBLIC_MEDIA_BASE) {
    return `${PUBLIC_MEDIA_BASE}/${value.replace(/^\/+/, '')}`;
  }

  return value;
}
