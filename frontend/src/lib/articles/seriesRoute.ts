import { loadDiscoverSnapshot } from './discover';
import {
  getSeriesBreadcrumbsCore,
  getSeriesChildrenCore,
  resolveSeriesRouteCore,
} from './resolveSeriesRouteCore';
import type { ArticleData, SeriesChildLink, SeriesHubPostLink } from './types';

export { getSeriesBreadcrumbsCore as getSeriesBreadcrumbs };
export { getSeriesChildrenCore as getSeriesChildren };

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
      hubPosts: SeriesHubPostLink[];
      pageTitle: string;
      breadcrumbs: ReturnType<typeof getSeriesBreadcrumbsCore>;
    }
  | {
      routeKind: 'index';
      slug: string;
      pageTitle: string;
      breadcrumbs: ReturnType<typeof getSeriesBreadcrumbsCore>;
      children: SeriesChildLink[];
    };

export async function resolveSeriesRoute(slug: string): Promise<SeriesRouteProps> {
  const { articles, hubs } = await loadDiscoverSnapshot();
  return resolveSeriesRouteCore(slug, articles, hubs) as SeriesRouteProps;
}
