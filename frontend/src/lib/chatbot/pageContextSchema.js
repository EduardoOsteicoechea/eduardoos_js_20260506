export const PAGE_CONTEXT_SCHEMA_VERSION = 1;

/** @typedef {'home' | 'profile' | 'series' | 'article' | 'post-editor' | 'post-creator' | 'server-health' | 'generic'} PageContextType */

/**
 * @typedef {Object} PageContextSection
 * @property {string} heading
 * @property {string} [excerpt]
 */

/**
 * @typedef {Object} PageContextPayload
 * @property {number} schemaVersion
 * @property {PageContextType} pageType
 * @property {string} pathname
 * @property {string} documentTitle
 * @property {string | null} heading
 * @property {string | null} excerpt
 * @property {string[]} [skillLabels]
 * @property {PageContextSection[]} [sections]
 * @property {Record<string, string>} [meta]
 * @property {string} capturedAt
 */

/**
 * @param {string} pathname
 * @returns {PageContextType}
 */
export function inferPageType(pathname) {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/profile' || path.startsWith('/profile/')) return 'profile';
  if (path === '/post/editor') return 'post-editor';
  if (path === '/catalog') return 'post-editor';
  if (path === '/post/creator') return 'post-creator';
  if (path === '/server/health') return 'server-health';
  if (path === '/series') return 'series';
  if (path.startsWith('/series/') || path.startsWith('/articles/')) return 'article';
  return 'generic';
}

/**
 * @param {unknown} value
 * @returns {value is PageContextPayload}
 */
export function isPageContextPayload(value) {
  if (!value || typeof value !== 'object') return false;
  const ctx = /** @type {PageContextPayload} */ (value);
  return (
    ctx.schemaVersion === PAGE_CONTEXT_SCHEMA_VERSION &&
    typeof ctx.pathname === 'string' &&
    typeof ctx.pageType === 'string' &&
    typeof ctx.capturedAt === 'string'
  );
}
