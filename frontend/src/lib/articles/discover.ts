import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import type { ArticleData, ArticleEntry } from './types';

const SERIES_ROOT = join(process.cwd(), 'public/data/series');
const DATA_FILE = 'data.json';
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

export async function discoverArticles(): Promise<ArticleEntry[]> {
  const dataFiles = await walkForDataFiles(SERIES_ROOT);
  const articles: ArticleEntry[] = [];

  for (const dataPath of dataFiles) {
    const raw = await readFile(dataPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);

    if (!isArticleData(parsed)) continue;

    articles.push({
      slug: toSlug(dataPath),
      data: parsed,
      dataPath: relative(join(process.cwd(), 'public'), dataPath).replace(/\\/g, '/'),
    });
  }

  return articles.sort((a, b) => a.slug.localeCompare(b.slug, 'es'));
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | undefined> {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  const articles = await discoverArticles();
  return articles.find((article) => article.slug === normalized);
}
