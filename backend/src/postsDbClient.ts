import {
  POSTS_DB_INTERNAL_TOKEN,
  POSTS_DB_URL,
} from './constants/index.js';

const INTERNAL_HEADER = 'X-Posts-Db-Internal-Token';

export interface PostsDbCatalog {
  series: string[];
  chapters: Record<string, string[]>;
}

export interface PostsDbArticleOption {
  id?: number;
  article_id: string;
  title: string;
}

export interface PostsDbDiscoverArticle {
  slug: string;
  data: Record<string, unknown>;
  sermon_url?: string;
}

export interface PostsDbDiscoverHub {
  slug: string;
  data: Record<string, unknown>;
}

export interface PostsDbDiscover {
  articles: PostsDbDiscoverArticle[];
  hubs: PostsDbDiscoverHub[];
  slugs: string[];
}

function postsDbBase(): string | null {
  const base = POSTS_DB_URL.trim().replace(/\/+$/g, '');
  return base || null;
}

async function postsDbFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = postsDbBase();
  if (!base) {
    throw new Error('POSTS_DB_URL is not configured');
  }
  if (!POSTS_DB_INTERNAL_TOKEN) {
    throw new Error('POSTS_DB_INTERNAL_TOKEN is not configured');
  }

  const headers = new Headers(init.headers);
  headers.set(INTERNAL_HEADER, POSTS_DB_INTERNAL_TOKEN);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `Posts DB error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function isPostsDbConfigured(): boolean {
  return Boolean(postsDbBase() && POSTS_DB_INTERNAL_TOKEN);
}

export async function fetchPostsDbCatalog(): Promise<PostsDbCatalog> {
  return postsDbFetch<PostsDbCatalog>('/catalog');
}

export async function fetchPostsDbArticles(
  serie: string,
  chapter: string,
): Promise<PostsDbArticleOption[]> {
  const params = new URLSearchParams({ series: serie, chapter });
  const data = await postsDbFetch<{ articles: PostsDbArticleOption[] }>(
    `/posts?${params.toString()}`,
  );
  return Array.isArray(data.articles) ? data.articles : [];
}

export async function fetchPostsDbArticle(
  serie: string,
  chapter: string,
  articleId: string,
): Promise<{ article: Record<string, unknown>; sermon_url?: string }> {
  const params = new URLSearchParams({
    series: serie,
    chapter,
    slug: articleId,
  });
  return postsDbFetch(`/article?${params.toString()}`);
}

export async function fetchPostsDbHub(
  serie: string,
  chapter: string,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ series: serie, chapter });
  const data = await postsDbFetch<{ hub: Record<string, unknown> }>(
    `/hub?${params.toString()}`,
  );
  return data.hub ?? {};
}

export async function fetchPostsDbDiscover(): Promise<PostsDbDiscover> {
  return postsDbFetch<PostsDbDiscover>('/discover');
}

export async function fetchPostsDbNextArticleId(
  serie: string,
  chapter: string,
): Promise<{ article_id: string; slug: string }> {
  const params = new URLSearchParams({ series: serie, chapter });
  return postsDbFetch(`/posts/next-id?${params.toString()}`);
}

export async function savePostsDbArticle(
  payload: Record<string, unknown>,
): Promise<{
  ok: boolean;
  post_id: number;
  section_article_id: number;
  path: string;
}> {
  return postsDbFetch('/article/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
