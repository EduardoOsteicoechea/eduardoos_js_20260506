import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Prefer backend series data in the monorepo so static generation matches /api/series/catalog.
 */
export function resolveSeriesDataRoot(): string {
  const candidates = [
    process.env.SERIES_DATA_ROOT,
    join(process.cwd(), '../backend/public/data/series'),
    join(process.cwd(), 'public/data/series'),
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const root of candidates) {
    if (existsSync(root)) return root;
  }

  return join(process.cwd(), 'public/data/series');
}
