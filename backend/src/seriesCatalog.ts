import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SERIES_DATA_ROOT } from './constants/index.js';

const DEFAULT_SERIES_ROOT = SERIES_DATA_ROOT;

export interface SeriesCatalog {
  series: string[];
  chapters: Record<string, string[]>;
}

export async function buildSeriesCatalog(
  root = process.env.SERIES_DATA_ROOT ?? DEFAULT_SERIES_ROOT,
): Promise<SeriesCatalog> {
  const series: string[] = [];
  const chapters: Record<string, string[]> = {};

  let serieEntries;
  try {
    serieEntries = await readdir(root, { withFileTypes: true });
  } catch {
    return { series: [], chapters: {} };
  }

  for (const serieEntry of serieEntries) {
    if (!serieEntry.isDirectory()) continue;

    const serieId = serieEntry.name;
    series.push(serieId);

    const seriePath = join(root, serieId);
    let chapterEntries;

    try {
      chapterEntries = await readdir(seriePath, { withFileTypes: true });
    } catch {
      chapters[serieId] = [];
      continue;
    }

    chapters[serieId] = chapterEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'es'));
  }

  return {
    series: series.sort((a, b) => a.localeCompare(b, 'es')),
    chapters,
  };
}

export interface NextArticleId {
  article_id: string;
  slug: string;
}

export async function getNextArticleId(
  serie: string,
  chapter: string,
  root = process.env.SERIES_DATA_ROOT ?? DEFAULT_SERIES_ROOT,
): Promise<NextArticleId> {
  const chapterPath = join(root, serie, chapter);
  let existingCount = 0;

  try {
    const entries = await readdir(chapterPath, { withFileTypes: true });
    existingCount = entries.filter((entry) => entry.isDirectory()).length;
  } catch {
    existingCount = 0;
  }

  const article_id = String(existingCount + 1);
  const slug = `${serie}/${chapter}/${article_id}`;

  return { article_id, slug };
}

export interface SeriesArticleOption {
  id?: number;
  article_id: string;
  title: string;
}

export async function listSeriesArticles(
  serie: string,
  chapter: string,
  root = process.env.SERIES_DATA_ROOT ?? DEFAULT_SERIES_ROOT,
): Promise<SeriesArticleOption[]> {
  const chapterPath = join(root, serie, chapter);
  const chapterMetadataPath = join(chapterPath, 'data.json');
  let entries;
  let metadataIds = new Map<string, number>();

  try {
    entries = await readdir(chapterPath, { withFileTypes: true });
  } catch {
    return [];
  }

  try {
    const raw = await readFile(chapterMetadataPath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const posts = Array.isArray(parsed?.posts) ? parsed.posts : [];
    metadataIds = new Map<string, number>();
    for (const post of posts) {
      if (!post || typeof post !== 'object') continue;
      const record = post as Record<string, unknown>;
      const name = String(record.name ?? '');
      const id = Number(record.id);
      if (!name || !Number.isFinite(id)) continue;
      metadataIds.set(name, id);
    }
  } catch {
    metadataIds = new Map();
  }

  const options = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const article_id = entry.name;
        const dataPath = join(chapterPath, article_id, 'data.json');
        const id = metadataIds.get(article_id);
        try {
          const raw = await readFile(dataPath, 'utf-8');
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          const title = String(parsed.title ?? '').trim() || article_id;
          return { id, article_id, title };
        } catch {
          return { id, article_id, title: article_id };
        }
      }),
  );

  return options.sort((a, b) => {
    if (Number.isFinite(a.id) && Number.isFinite(b.id)) {
      return Number(a.id) - Number(b.id);
    }
    return a.article_id.localeCompare(b.article_id, 'es');
  });
}

export async function readSeriesArticle(
  serie: string,
  chapter: string,
  article_id: string,
  root = process.env.SERIES_DATA_ROOT ?? DEFAULT_SERIES_ROOT,
): Promise<Record<string, unknown>> {
  const dataPath = join(root, serie, chapter, article_id, 'data.json');
  const raw = await readFile(dataPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('data.json inválido');
  }
  return parsed as Record<string, unknown>;
}
