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

function postsDbBase(): string | null {
  const base = POSTS_DB_URL.trim().replace(/\/+$/g, '');
  return base || null;
}

async function postsDbFetch<T>(path: string): Promise<T> {
  const base = postsDbBase();
  if (!base) {
    throw new Error('POSTS_DB_URL is not configured');
  }
  if (!POSTS_DB_INTERNAL_TOKEN) {
    throw new Error('POSTS_DB_INTERNAL_TOKEN is not configured');
  }

  const response = await fetch(`${base}${path}`, {
    headers: {
      [INTERNAL_HEADER]: POSTS_DB_INTERNAL_TOKEN,
    },
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
