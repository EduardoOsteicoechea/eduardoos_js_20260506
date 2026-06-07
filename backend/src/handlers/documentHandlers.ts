import type { Request, Response } from 'express';
import { DOCUMENTER_URL } from '../constants/index.js';
import { buildMediaProxyUrl } from '../mediaProxy.js';

export async function downloadArticlePdf(req: Request, res: Response) {
  try {
    const documenterBase = DOCUMENTER_URL.replace(/\/+$/g, '');
    const response = await fetch(`${documenterBase}/documents/article-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error:
          typeof data?.error === 'string'
            ? data.error
            : 'No se pudo generar el PDF',
      });
    }

    const key = String(data.key ?? '').trim();
    const url = key ? buildMediaProxyUrl(key) : String(data.url ?? '').trim();

    return res.json({
      ok: true,
      url,
      key,
      publicPath: url,
      bytes: data.bytes,
    });
  } catch (error) {
    console.error('[documents/article-pdf]', error);
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Documenter no disponible',
    });
  }
}
