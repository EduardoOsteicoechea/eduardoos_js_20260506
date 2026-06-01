import { slugifySegment } from './slugify';
import { resolveCatalogValue } from './buildPostPayload';

export function getEffectiveSerie(form) {
  return resolveCatalogValue(
    form.serieIsCustom,
    form.serieCustom,
    form.serie,
  );
}

export function getEffectiveChapter(form) {
  return resolveCatalogValue(
    form.chapterIsCustom,
    form.chapterCustom,
    form.chapter,
  );
}

export function mergeSeriesOptions(catalog, form) {
  const options = new Set(catalog.series ?? []);
  const effective = getEffectiveSerie(form);

  if (effective) options.add(effective);

  return [...options].sort((a, b) => a.localeCompare(b, 'es'));
}

export function mergeChapterOptions(catalog, form) {
  const serie = getEffectiveSerie(form);
  if (!serie) return [];

  const options = new Set(catalog.chapters?.[serie] ?? []);
  const effective = getEffectiveChapter(form);

  if (effective) options.add(effective);

  return [...options].sort((a, b) => a.localeCompare(b, 'es'));
}

export function canEditChapter(form) {
  return Boolean(getEffectiveSerie(form) || (form.serieIsCustom && form.serieCustom.trim()));
}

export function registerSerieInCatalog(catalog, serieSlug) {
  if (!serieSlug) return catalog;

  const series = [...new Set([...(catalog.series ?? []), serieSlug])].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );

  return {
    ...catalog,
    series,
    chapters: {
      ...catalog.chapters,
      [serieSlug]: catalog.chapters?.[serieSlug] ?? [],
    },
  };
}

export function registerChapterInCatalog(catalog, serieSlug, chapterSlug) {
  if (!serieSlug || !chapterSlug) return catalog;

  const existing = catalog.chapters?.[serieSlug] ?? [];
  const chapters = {
    ...catalog.chapters,
    [serieSlug]: [...new Set([...existing, chapterSlug])].sort((a, b) =>
      a.localeCompare(b, 'es'),
    ),
  };

  return { ...catalog, chapters };
}

export function previewSlug(value) {
  return slugifySegment(value);
}
