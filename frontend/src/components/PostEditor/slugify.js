export function slugifySegment(value) {
  if (!value?.trim()) return '';

  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function buildArticleSlug(serie, chapter, articleId) {
  const seriePart = slugifySegment(serie);
  const chapterPart = slugifySegment(chapter);
  const idPart = String(articleId ?? '').trim();

  return [seriePart, chapterPart, idPart].filter(Boolean).join('/');
}
