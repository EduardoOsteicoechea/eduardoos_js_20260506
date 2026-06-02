export function slugifySegment(value) {
  if (!value?.trim()) return '';

  return normalizeKebabInput(value)
    .replace(/^-+|-+$/g, '');
}

export function normalizeKebabInput(value) {
  if (value == null) return '';

  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/^\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-');
}

export function buildArticleSlug(serie, chapter, articleId) {
  const seriePart = slugifySegment(serie);
  const chapterPart = slugifySegment(chapter);
  const idPart = String(articleId ?? '').trim();

  return [seriePart, chapterPart, idPart].filter(Boolean).join('/');
}
