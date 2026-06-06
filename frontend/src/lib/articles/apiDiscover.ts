import type {
  ArticleData,
  ArticleEntry,
  SeriesHubData,
  SeriesHubEntry,
} from './types';
import { buildArticleApiPath, getApiBase } from './articleApi';

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

let discoverCache: Promise<{
  articles: ArticleEntry[];
  hubs: SeriesHubEntry[];
  slugs: string[];
}> | null = null;

async function fetchDiscoverPayload(): Promise<DiscoverResponse> {
  const base = getApiBase();
  const response = await fetch(`${base}/api/series/discover`);

  if (!response.ok) {
    throw new Error(`backend discover failed (${response.status})`);
  }

  return (await response.json()) as DiscoverResponse;
}

export function resetDiscoverCache() {
  discoverCache = null;
}

export async function loadDiscoverSnapshot() {
  if (import.meta.env.DEV) {
    return buildDiscoverSnapshot(await fetchDiscoverPayload());
  }

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
    dataPath: buildArticleApiPath(entry.slug),
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
