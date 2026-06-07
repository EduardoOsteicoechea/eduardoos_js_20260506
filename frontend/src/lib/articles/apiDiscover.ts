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

interface CatalogResponse {
  series?: string[];
  chapters?: Record<string, string[]>;
}

interface ArticlesListResponse {
  articles?: Array<{ article_id?: string }>;
}

interface HubResponse {
  hub?: SeriesHubData;
}

interface ArticleResponse {
  article?: ArticleData;
  sermon_url?: string;
}

const EMPTY_SNAPSHOT = {
  articles: [] as ArticleEntry[],
  hubs: [] as SeriesHubEntry[],
  slugs: [] as string[],
};

let discoverCache: Promise<typeof EMPTY_SNAPSHOT> | null = null;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchDiscoverFromCatalogApis(base: string): Promise<DiscoverResponse> {
  const catalog = await fetchJson<CatalogResponse>(`${base}/api/series/catalog`);
  if (!catalog) {
    console.warn('[build] catalog API unavailable — generating minimal static routes');
    return { articles: [], hubs: [], slugs: [] };
  }

  const articles: NonNullable<DiscoverResponse['articles']> = [];
  const hubs: NonNullable<DiscoverResponse['hubs']> = [];
  const slugSet = new Set<string>();

  for (const serie of catalog.series ?? []) {
    const cleanSerie = String(serie).trim();
    if (!cleanSerie) continue;

    slugSet.add(cleanSerie);

    for (const chapter of catalog.chapters?.[cleanSerie] ?? []) {
      const cleanChapter = String(chapter).trim();
      if (!cleanChapter) continue;

      const hubSlug = `${cleanSerie}/${cleanChapter}`;
      slugSet.add(hubSlug);

      const hubPayload = await fetchJson<HubResponse>(
        `${base}/api/series/hub?${new URLSearchParams({
          serie: cleanSerie,
          chapter: cleanChapter,
        })}`,
      );
      if (hubPayload?.hub) {
        hubs.push({ slug: hubSlug, data: hubPayload.hub });
      }

      const listPayload = await fetchJson<ArticlesListResponse>(
        `${base}/api/series/articles?${new URLSearchParams({
          serie: cleanSerie,
          chapter: cleanChapter,
        })}`,
      );

      for (const entry of listPayload?.articles ?? []) {
        const articleId = String(entry.article_id ?? '').trim();
        if (!articleId) continue;

        const articleSlug = `${hubSlug}/${articleId}`;
        slugSet.add(articleSlug);

        const articlePayload = await fetchJson<ArticleResponse>(
          `${base}/api/series/article?${new URLSearchParams({
            serie: cleanSerie,
            chapter: cleanChapter,
            article_id: articleId,
          })}`,
        );

        if (articlePayload?.article) {
          articles.push({
            slug: articleSlug,
            data: articlePayload.article,
            sermon_url: articlePayload.sermon_url,
          });
        }
      }
    }
  }

  return {
    articles,
    hubs,
    slugs: [...slugSet].sort((a, b) => a.localeCompare(b, 'es')),
  };
}

async function fetchDiscoverPayload(): Promise<DiscoverResponse> {
  const base = getApiBase();

  try {
    const response = await fetch(`${base}/api/series/discover`, {
      cache: 'no-store',
    });

    if (response.ok) {
      return (await response.json()) as DiscoverResponse;
    }

    console.warn(
      `[build] /api/series/discover failed (${response.status}), using catalog fallback`,
    );
  } catch (error) {
    console.warn('[build] /api/series/discover unreachable, using catalog fallback', error);
  }

  return fetchDiscoverFromCatalogApis(base);
}

export function resetDiscoverCache() {
  discoverCache = null;
}

export async function loadDiscoverSnapshot() {
  if (import.meta.env.DEV) {
    return buildDiscoverSnapshot(await fetchDiscoverPayload());
  }

  if (!discoverCache) {
    discoverCache = fetchDiscoverPayload()
      .then((payload) => buildDiscoverSnapshot(payload))
      .catch((error) => {
        console.warn('[build] discover snapshot failed, using empty routes', error);
        return EMPTY_SNAPSHOT;
      });
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
