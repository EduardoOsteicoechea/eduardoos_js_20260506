import { formatSegmentLabel } from '../series/formatSegmentLabel.js';
import { loadDiscoverSnapshot } from './apiDiscover';

export { loadDiscoverSnapshot };

export { formatSegmentLabel };

import type {
  ArticleData,
  ArticleEntry,
  SeriesChildLink,
  SeriesHubData,
  SeriesHubEntry,
  SeriesHubPostLink,
} from './types';

export function getAncestorSlugs(slug: string): string[] {
  const parts = slug.split('/').filter(Boolean);
  const ancestors: string[] = [];
  for (let index = 1; index < parts.length; index += 1) {
    ancestors.push(parts.slice(0, index).join('/'));
  }
  return ancestors;
}

export async function discoverArticles(): Promise<ArticleEntry[]> {
  const { articles } = await loadDiscoverSnapshot();
  return articles.sort((a, b) => a.slug.localeCompare(b.slug, 'es'));
}

export async function discoverHubs(): Promise<SeriesHubEntry[]> {
  const { hubs } = await loadDiscoverSnapshot();
  return hubs.sort((a, b) => a.slug.localeCompare(b.slug, 'es'));
}

export async function discoverSeriesSlugs(): Promise<string[]> {
  const { slugs } = await loadDiscoverSnapshot();
  return slugs;
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | undefined> {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  const articles = await discoverArticles();
  return articles.find((article) => article.slug === normalized);
}

export async function getHubBySlug(slug: string): Promise<SeriesHubEntry | undefined> {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  const hubs = await discoverHubs();
  return hubs.find((hub) => hub.slug === normalized);
}

export async function getSeriesChildren(
  parentSlug: string,
  articles: ArticleEntry[],
  hubs: SeriesHubEntry[],
): Promise<SeriesChildLink[]> {
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

export function getHubPostLinks(
  hubSlug: string,
  hub: SeriesHubData,
  articles: ArticleEntry[],
): SeriesHubPostLink[] {
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

  return hub.posts.map((post) => {
    const postSlug = `${hubSlug}/${post.name}`;
    const article = articleBySlug.get(postSlug);

    return {
      ...post,
      slug: postSlug,
      href: article ? `/series/${postSlug}` : undefined,
      available: Boolean(article),
      articleTitle: article?.data.title,
    };
  });
}

export function getSeriesBreadcrumbs(slug: string): { href: string; label: string }[] {
  const parts = slug.split('/').filter(Boolean);
  const crumbs: { href: string; label: string }[] = [
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
