import {
  formatSegmentLabel,
  getHubPostLinks,
  getSeriesBreadcrumbs,
  getSeriesChildren,
  loadDiscoverSnapshot,
} from './discover';
import type { ArticleData } from './types';

export type SeriesRouteProps =
  | {
      routeKind: 'article';
      slug: string;
      article: ArticleData;
      articleApiPath: string;
      sermonPath?: string;
    }
  | {
      routeKind: 'hub';
      slug: string;
      hub: import('./types').SeriesHubData;
      hubPosts: ReturnType<typeof getHubPostLinks>;
      pageTitle: string;
      breadcrumbs: ReturnType<typeof getSeriesBreadcrumbs>;
    }
  | {
      routeKind: 'index';
      slug: string;
      pageTitle: string;
      breadcrumbs: ReturnType<typeof getSeriesBreadcrumbs>;
      children: Awaited<ReturnType<typeof getSeriesChildren>>;
    };

export async function resolveSeriesRoute(slug: string): Promise<SeriesRouteProps> {
  const { articles, hubs } = await loadDiscoverSnapshot();
  const hubBySlug = new Map(hubs.map((hub) => [hub.slug, hub]));
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

  const article = articleBySlug.get(slug);
  if (article) {
    return {
      routeKind: 'article',
      slug,
      article: article.data,
      articleApiPath: article.dataPath,
      sermonPath: article.sermonPath,
    };
  }

  const hub = hubBySlug.get(slug);
  if (hub) {
    const pageTitle = hub.data.section
      ? String(hub.data.section)
      : formatSegmentLabel(slug.split('/').pop() ?? slug);

    return {
      routeKind: 'hub',
      slug,
      hub: hub.data,
      hubPosts: getHubPostLinks(slug, hub.data, articles),
      pageTitle,
      breadcrumbs: getSeriesBreadcrumbs(slug),
    };
  }

  const pageTitle = formatSegmentLabel(slug.split('/').pop() ?? slug);

  return {
    routeKind: 'index',
    slug,
    pageTitle,
    breadcrumbs: getSeriesBreadcrumbs(slug),
    children: await getSeriesChildren(slug, articles, hubs),
  };
}
