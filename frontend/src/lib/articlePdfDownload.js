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

function filenameFromDisposition(disposition) {
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition ?? '');
  if (!match?.[1]) return 'document.pdf';
  try {
    return decodeURIComponent(match[1].replace(/"/g, '').trim());
  } catch {
    return match[1].replace(/"/g, '').trim() || 'document.pdf';
  }
}

function filenameFromPayload(payload) {
  const title = String(payload?.title ?? '').trim();
  if (!title) return 'document.pdf';
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return safe ? `${safe}.pdf` : 'document.pdf';
}

/**
 * POST article JSON to backend → documenter PDF → browser download.
 * @param {Record<string, unknown>} payload
 */
export async function downloadArticlePdf(payload) {
  const response = await fetch('/api/documents/article-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data?.error === 'string') message = data.error;
    } catch {
      // binary error body
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition
    ? filenameFromDisposition(disposition)
    : filenameFromPayload(payload);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
