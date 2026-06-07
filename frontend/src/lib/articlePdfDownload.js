/**
 * Build documenter payload from a series article slug + JSON data.
 * @param {string} slug e.g. "romanos/pablo/llamado"
 * @param {{ title?: string; creator?: string; sections?: unknown[]; serie?: string; series?: string }} article
 */
export function buildPdfPayloadFromArticle(slug, article) {
  const parts = String(slug ?? '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  const serie = parts[0] ?? article?.serie ?? article?.series ?? '';
  const chapter = parts[1] ?? '';
  const folder = parts[2] ?? parts[parts.length - 1] ?? '';

  return {
    serie,
    series: serie,
    chapter,
    section: chapter,
    folder_name: folder,
    article_id: folder,
    title: String(article?.title ?? '').trim(),
    creator: article?.creator?.trim?.() ?? article?.creator,
    sections: Array.isArray(article?.sections) ? article.sections : [],
  };
}

/**
 * Generate article PDF in documenter, persist to S3, and open it for print/download.
 * @param {Record<string, unknown>} payload
 */
export async function downloadArticlePdf(payload) {
  const response = await fetch('/api/documents/article-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`,
    );
  }

  const url = String(data?.url ?? data?.publicPath ?? '').trim();
  if (!url) {
    throw new Error('El documento se generó pero no se recibió la URL de S3');
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(url);
  }

  return {
    url,
    key: data.key,
    bytes: data.bytes,
  };
}
