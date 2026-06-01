export async function fetchSeriesCatalog() {
  const response = await fetch('/api/series/catalog');
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo cargar el catálogo de series');
  }

  return {
    series: Array.isArray(data.series) ? data.series : [],
    chapters:
      data.chapters && typeof data.chapters === 'object' ? data.chapters : {},
  };
}

export async function fetchNextArticleId(serie, chapter) {
  const params = new URLSearchParams({ serie, chapter });
  const response = await fetch(`/api/series/next-article-id?${params}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo asignar el id del artículo');
  }

  return {
    articleId: String(data.article_id ?? ''),
  };
}
