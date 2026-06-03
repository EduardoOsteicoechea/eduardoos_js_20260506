import { access, readFile, readdir } from 'node:fs/promises';

import { constants } from 'node:fs';

import { dirname, join, relative, sep } from 'node:path';

import { formatSegmentLabel } from '../series/formatSegmentLabel.js';
import { resolveSeriesDataRoot } from './seriesDataRoot';

export { formatSegmentLabel };

import type {

  ArticleData,

  ArticleEntry,

  SeriesChildLink,

  SeriesHubData,

  SeriesHubEntry,

  SeriesHubPostLink,

} from './types';



const SERIES_ROOT = resolveSeriesDataRoot();

const DATA_FILE = 'data.json';

const SERMON_FILE = 'sermon.mp3';

const COPY_FILE_PATTERN = /data copy/i;



function isArticleData(data: unknown): data is ArticleData {

  if (!data || typeof data !== 'object') return false;

  const record = data as Record<string, unknown>;

  return (

    typeof record.title === 'string' &&

    Array.isArray(record.sections) &&

    record.sections.length > 0

  );

}



function isHubData(data: unknown): data is SeriesHubData {

  if (!data || typeof data !== 'object') return false;

  const record = data as Record<string, unknown>;

  if (!Array.isArray(record.posts) || record.posts.length === 0) return false;

  return record.posts.every(

    (post) =>

      post &&

      typeof post === 'object' &&

      typeof (post as Record<string, unknown>).name === 'string',

  );

}



async function walkForDataFiles(dir: string): Promise<string[]> {

  const entries = await readdir(dir, { withFileTypes: true });

  const files: string[] = [];



  for (const entry of entries) {

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {

      files.push(...(await walkForDataFiles(fullPath)));

      continue;

    }

    if (entry.name === DATA_FILE && !COPY_FILE_PATTERN.test(fullPath)) {

      files.push(fullPath);

    }

  }



  return files;

}



function toSlug(dataFilePath: string): string {

  const articleDir = relative(SERIES_ROOT, dataFilePath).replace(/[\\/]data\.json$/, '');

  return articleDir.split(sep).join('/');

}



export function getAncestorSlugs(slug: string): string[] {

  const parts = slug.split('/').filter(Boolean);

  const ancestors: string[] = [];

  for (let index = 1; index < parts.length; index += 1) {

    ancestors.push(parts.slice(0, index).join('/'));

  }

  return ancestors;

}



async function readDataJson(dataPath: string): Promise<unknown> {

  const raw = await readFile(dataPath, 'utf-8');

  return JSON.parse(raw) as unknown;

}



export async function discoverArticles(): Promise<ArticleEntry[]> {

  const dataFiles = await walkForDataFiles(SERIES_ROOT);

  const articles: ArticleEntry[] = [];



  for (const dataPath of dataFiles) {

    const parsed = await readDataJson(dataPath);



    if (!isArticleData(parsed)) continue;



    const slug = toSlug(dataPath);

    const sermonFile = join(dirname(dataPath), SERMON_FILE);

    let sermonPath: string | undefined;



    try {

      await access(sermonFile, constants.F_OK);

      sermonPath = `/data/series/${slug}/${SERMON_FILE}`;

    } catch {

      sermonPath = undefined;

    }



    articles.push({

      slug,

      data: parsed,

      dataPath: relative(join(process.cwd(), 'public'), dataPath).replace(/\\/g, '/'),

      sermonPath,

    });

  }



  return articles.sort((a, b) => a.slug.localeCompare(b.slug, 'es'));

}



export async function discoverHubs(): Promise<SeriesHubEntry[]> {

  const dataFiles = await walkForDataFiles(SERIES_ROOT);

  const hubs: SeriesHubEntry[] = [];



  for (const dataPath of dataFiles) {

    const parsed = await readDataJson(dataPath);

    if (!isHubData(parsed) || isArticleData(parsed)) continue;



    hubs.push({

      slug: toSlug(dataPath),

      data: parsed,

    });

  }



  return hubs.sort((a, b) => a.slug.localeCompare(b.slug, 'es'));

}



export async function discoverSeriesSlugs(): Promise<string[]> {

  const articles = await discoverArticles();

  const hubs = await discoverHubs();

  const slugs = new Set<string>();



  for (const article of articles) {

    slugs.add(article.slug);

    for (const ancestor of getAncestorSlugs(article.slug)) {

      slugs.add(ancestor);

    }

  }



  for (const hub of hubs) {

    slugs.add(hub.slug);

    for (const ancestor of getAncestorSlugs(hub.slug)) {

      slugs.add(ancestor);

    }

  }



  return [...slugs].sort((a, b) => a.localeCompare(b, 'es'));

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

  const parentDir = normalized ? join(SERIES_ROOT, ...normalized.split('/')) : SERIES_ROOT;



  let entries;

  try {

    entries = await readdir(parentDir, { withFileTypes: true });

  } catch {

    return [];

  }



  const children: SeriesChildLink[] = [];



  for (const entry of entries) {

    if (!entry.isDirectory()) continue;



    const childSlug = normalized ? `${normalized}/${entry.name}` : entry.name;

    const article = articles.find((item) => item.slug === childSlug);

    const hub = hubs.find((item) => item.slug === childSlug);

    const hasDescendantArticle = articles.some((item) =>

      item.slug.startsWith(`${childSlug}/`),

    );



    if (!hub && !article && !hasDescendantArticle) continue;



    let label = formatSegmentLabel(entry.name);

    let description: string | undefined;

    let kind: SeriesChildLink['kind'] = 'folder';



    if (hub) {

      label = hub.data.section ? String(hub.data.section) : label;

      description = hub.data.description;

      kind = 'hub';

    } else if (article) {

      label = article.data.title;

      kind = 'article';

    }



    children.push({

      slug: childSlug,

      label,

      description,

      kind,

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


