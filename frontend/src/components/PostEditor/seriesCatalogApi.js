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

export async function fetchSeriesArticles(serie, chapter) {
  const params = new URLSearchParams({ serie, chapter });
  const response = await fetch(`/api/series/articles?${params}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo cargar la lista de artículos');
  }

  const articles = Array.isArray(data.articles) ? data.articles : [];
  return articles.map((entry) => ({
    id: Number(entry?.id ?? 0) || undefined,
    articleId: String(entry?.article_id ?? ''),
    title: String(entry?.title ?? ''),
  }));
}

export async function fetchSeriesArticle(serie, chapter, articleId) {
  const params = new URLSearchParams({
    serie,
    chapter,
    article_id: articleId,
  });
  const response = await fetch(`/api/series/article?${params}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo cargar el artículo');
  }

  return data.article && typeof data.article === 'object' ? data.article : null;
}
