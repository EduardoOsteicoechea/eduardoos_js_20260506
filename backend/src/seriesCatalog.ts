import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_SERIES_ROOT = join(
  process.cwd(),
  '../frontend/public/data/series',
);

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
