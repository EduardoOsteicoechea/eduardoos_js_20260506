import type {
  ArticleData,
  ArticleEntry,
  SeriesHubData,
  SeriesHubEntry,
} from './types';

interface DiscoverResponse {
  articles?: Array<{
    slug: string;
    data: ArticleData;
    sermon_url?: string;
  }>;
  hubs?: Array<{
    slug: string;
    data: SeriesHubData;
  }>;
  slugs?: string[];
}

function postsDbBase(): string | null {
  const direct = process.env.POSTS_DB_URL?.trim().replace(/\/+$/g, '');
  if (direct) return direct;
  return null;
}

function apiBase(): string {
  return (process.env.PUBLIC_API_BASE || 'http://127.0.0.1:8080').replace(
    /\/+$/g,
    '',
  );
}

let discoverCache: Promise<{
  articles: ArticleEntry[];
  hubs: SeriesHubEntry[];
  slugs: string[];
}> | null = null;

async function fetchDiscoverPayload(): Promise<DiscoverResponse> {
  const token = process.env.POSTS_DB_INTERNAL_TOKEN?.trim();
  const postsDb = postsDbBase();

  if (postsDb && token) {
    const response = await fetch(`${postsDb}/discover`, {
      headers: { 'X-Posts-Db-Internal-Token': token },
    });
    if (!response.ok) {
      throw new Error(`posts-db discover failed (${response.status})`);
    }
    return (await response.json()) as DiscoverResponse;
  }

  const response = await fetch(`${apiBase()}/api/series/discover`);
  if (!response.ok) {
    throw new Error(`backend discover failed (${response.status})`);
  }
  return (await response.json()) as DiscoverResponse;
}

export async function loadDiscoverSnapshot() {
  if (!discoverCache) {
    discoverCache = (async () => {
      const payload = await fetchDiscoverPayload();
      return buildDiscoverSnapshot(payload);
    })();
  }

  return discoverCache;
}

function buildDiscoverSnapshot(payload: DiscoverResponse) {

  const articles: ArticleEntry[] = (payload.articles ?? []).map((entry) => ({
    slug: entry.slug,
    data: entry.data,
    dataPath: `/api/series/article?serie=${entry.slug.split('/')[0]}&chapter=${entry.slug.split('/')[1]}&article_id=${entry.slug.split('/').slice(2).join('/')}`,
    sermonPath: entry.sermon_url || undefined,
  }));

  const hubs: SeriesHubEntry[] = (payload.hubs ?? []).map((entry) => ({
    slug: entry.slug,
    data: entry.data,
  }));

  const slugs = Array.isArray(payload.slugs)
    ? [...payload.slugs].sort((a, b) => a.localeCompare(b, 'es'))
    : [];

  return { articles, hubs, slugs };
}
