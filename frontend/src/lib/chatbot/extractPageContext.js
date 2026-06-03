import {
  inferPageType,
  PAGE_CONTEXT_SCHEMA_VERSION,
} from './pageContextSchema';

const MAX_EXCERPT = 1400;

/**
 * @param {ParentNode | null | undefined} root
 * @param {number} maxLen
 */
function textExcerpt(root, maxLen = MAX_EXCERPT) {
  if (!root || typeof document === 'undefined') return null;
  const clone = root.cloneNode(true);
  clone
    .querySelectorAll(
      'script, style, nav, footer, .home-skills, [aria-hidden="true"]',
    )
    .forEach((node) => node.remove());

  const text = (clone.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return null;
  return text.length <= maxLen ? text : `${text.slice(0, maxLen)}…`;
}

/**
 * @param {string} pathname
 * @returns {import('./pageContextSchema').PageContextPayload}
 */
export function extractPageContext(pathname) {
  if (typeof document === 'undefined') {
    return {
      schemaVersion: PAGE_CONTEXT_SCHEMA_VERSION,
      pageType: inferPageType(pathname),
      pathname,
      documentTitle: '',
      heading: null,
      excerpt: null,
      capturedAt: new Date().toISOString(),
    };
  }

  const pageRoot =
    document.querySelector('.page-content main') ??
    document.querySelector('.page-content');

  const heading =
    pageRoot?.querySelector('h1')?.textContent?.trim() ??
    pageRoot?.querySelector('h2')?.textContent?.trim() ??
    null;

  const skillLabels = Array.from(
    pageRoot?.querySelectorAll('.home-skills h3') ?? [],
  )
    .map((el) => el.textContent?.trim())
    .filter(Boolean);

  const sectionHeadings = Array.from(
    pageRoot?.querySelectorAll(
      '.article-section-heading, .article-generator h2, section h2',
    ) ?? [],
  )
    .slice(0, 12)
    .map((el) => ({
      heading: el.textContent?.trim() ?? '',
      excerpt: null,
    }))
    .filter((s) => s.heading);

  const meta = {};
  const articleSlug = document.querySelector('[data-article-slug]');
  if (articleSlug instanceof HTMLElement && articleSlug.dataset.articleSlug) {
    meta.articleSlug = articleSlug.dataset.articleSlug;
  }

  return {
    schemaVersion: PAGE_CONTEXT_SCHEMA_VERSION,
    pageType: inferPageType(pathname),
    pathname,
    documentTitle: document.title,
    heading,
    excerpt: textExcerpt(pageRoot),
    skillLabels: skillLabels.length ? skillLabels : undefined,
    sections: sectionHeadings.length ? sectionHeadings : undefined,
    meta: Object.keys(meta).length ? meta : undefined,
    capturedAt: new Date().toISOString(),
  };
}
