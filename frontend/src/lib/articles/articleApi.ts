/** Base URL for server-side fetches (Astro build). Browser code uses relative /api paths. */
export function getApiBase(): string {
  const fromEnv = process.env.PUBLIC_API_BASE?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/g, '');
  }
  return 'https://eduardoos.com';
}

export function parseSeriesSlug(slug: string) {
  const parts = slug.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return {
    serie: parts[0] ?? '',
    chapter: parts[1] ?? '',
    articleId: parts.slice(2).join('/'),
  };
}

/** Relative path for browser and nginx → backend proxy. */
export function buildArticleApiPath(slug: string): string {
  const { serie, chapter, articleId } = parseSeriesSlug(slug);
  const params = new URLSearchParams({
    serie,
    chapter,
    article_id: articleId,
  });
  return `/api/series/article?${params}`;
}

export function buildArticleApiUrl(slug: string, base = getApiBase()): string {
  return `${base.replace(/\/+$/g, '')}${buildArticleApiPath(slug)}`;
}

export interface ArticleApiResponse {
  article?: Record<string, unknown>;
  sermon_url?: string;
}

export async function fetchArticleApi(
  slug: string,
  options: { base?: string } = {},
): Promise<ArticleApiResponse> {
  const base = options.base?.replace(/\/+$/g, '') ?? getApiBase();
  const response = await fetch(buildArticleApiUrl(slug, base));

  if (!response.ok) {
    throw new Error(`article API failed (${response.status})`);
  }

  return (await response.json()) as ArticleApiResponse;
}
