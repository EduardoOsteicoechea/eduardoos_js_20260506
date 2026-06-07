import { getApiBase } from './articleApi';

interface CatalogResponse {
  series?: string[];
  chapters?: Record<string, string[]>;
}

export async function collectSeriesBuildSlugs(
  discoverSlugs: string[],
): Promise<string[]> {
  const slugs = new Set(discoverSlugs);

  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/series/catalog`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const catalog = (await response.json()) as CatalogResponse;
      for (const serie of catalog.series ?? []) {
        const cleanSerie = String(serie).trim();
        if (!cleanSerie) continue;
        slugs.add(cleanSerie);
        for (const chapter of catalog.chapters?.[cleanSerie] ?? []) {
          const cleanChapter = String(chapter).trim();
          if (cleanChapter) {
            slugs.add(`${cleanSerie}/${cleanChapter}`);
          }
        }
      }
    }
  } catch {
    // Discover slugs alone are enough when catalog is unreachable at build time.
  }

  return [...slugs].sort((a, b) => a.localeCompare(b, 'es'));
}
