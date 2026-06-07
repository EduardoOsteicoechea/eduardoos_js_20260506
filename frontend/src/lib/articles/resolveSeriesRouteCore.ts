import { formatSegmentLabel } from '../series/formatSegmentLabel.js';
import { getHubPostLinks } from './hubPostLinks';
import type {
  ArticleEntry,
  SeriesChildLink,
  SeriesHubEntry,
} from './types';

export type SeriesRouteCore =
  | {
      routeKind: 'article';
      slug: string;
      article: ArticleEntry['data'];
      articleApiPath: string;
      sermonPath?: string;
    }
  | {
      routeKind: 'hub';
      slug: string;
      hub: SeriesHubEntry['data'];
      hubPosts: ReturnType<typeof getHubPostLinks>;
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

export function getSeriesBreadcrumbsCore(slug: string) {
  const parts = slug.split('/').filter(Boolean);
  const crumbs: { href: string; label: string; labelKey?: string }[] = [
    { href: '/series', label: 'Posts', labelKey: 'posts' },
  ];

  for (let index = 0; index < parts.length - 1; index += 1) {
    const path = parts.slice(0, index + 1).join('/');
    crumbs.push({
      href: `/series/${path}`,
      label: formatSegmentLabel(parts[index]),
    });
  }

  return crumbs;
}

export function getSeriesChildrenCore(
  parentSlug: string,
  articles: ArticleEntry[],
  hubs: SeriesHubEntry[],
): SeriesChildLink[] {
  const normalized = parentSlug.replace(/^\/+|\/+$/g, '');
  const childSlugs = new Set<string>();

  for (const slug of [
    ...hubs.map((hub) => hub.slug),
    ...articles.map((article) => article.slug),
  ]) {
    if (normalized && !slug.startsWith(`${normalized}/`)) continue;

    const remainder = normalized ? slug.slice(normalized.length + 1) : slug;
    const childName = remainder.split('/')[0];
    if (!childName) continue;

    childSlugs.add(normalized ? `${normalized}/${childName}` : childName);
  }

  const children: SeriesChildLink[] = [];

  for (const childSlug of childSlugs) {
    const hub = hubs.find((item) => item.slug === childSlug);
    const article = articles.find((item) => item.slug === childSlug);
    const segment = childSlug.split('/').at(-1) ?? childSlug;

    if (hub) {
      children.push({
        slug: childSlug,
        label: hub.data.section ? String(hub.data.section) : formatSegmentLabel(segment),
        description: hub.data.description,
        kind: 'hub',
      });
      continue;
    }

    if (article) {
      children.push({
        slug: childSlug,
        label: article.data.title,
        kind: 'article',
      });
      continue;
    }

    children.push({
      slug: childSlug,
      label: formatSegmentLabel(segment),
      kind: 'folder',
    });
  }

  return children.sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export function resolveSeriesRouteCore(
  slug: string,
  articles: ArticleEntry[],
  hubs: SeriesHubEntry[],
): SeriesRouteCore {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  const hubBySlug = new Map(hubs.map((hub) => [hub.slug, hub]));
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

  const article = articleBySlug.get(normalized);
  if (article) {
    return {
      routeKind: 'article',
      slug: normalized,
      article: article.data,
      articleApiPath: article.dataPath,
      sermonPath: article.sermonPath,
    };
  }

  const hub = hubBySlug.get(normalized);
  if (hub) {
    const pageTitle = hub.data.section
      ? String(hub.data.section)
      : formatSegmentLabel(normalized.split('/').pop() ?? normalized);

    return {
      routeKind: 'hub',
      slug: normalized,
      hub: hub.data,
      hubPosts: getHubPostLinks(normalized, hub.data, articles),
      pageTitle,
      breadcrumbs: getSeriesBreadcrumbsCore(normalized),
    };
  }

  const pageTitle = formatSegmentLabel(normalized.split('/').pop() ?? normalized);

  return {
    routeKind: 'index',
    slug: normalized,
    pageTitle,
    breadcrumbs: getSeriesBreadcrumbsCore(normalized),
    children: getSeriesChildrenCore(normalized, articles, hubs),
  };
}
