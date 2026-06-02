import type { Request, Response } from 'express';
import { DOCUMENTER_URL } from '../constants/index.js';

export async function downloadArticlePdf(req: Request, res: Response) {
  try {
    const documenterBase = DOCUMENTER_URL.replace(/\/+$/g, '');
    const response = await fetch(
      `${documenterBase}/documents/article-pdf?download=1`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        ok: false,
        error:
          typeof data?.error === 'string'
            ? data.error
            : 'No se pudo generar el PDF',
      });
    }

    const contentType = response.headers.get('content-type') ?? 'application/pdf';
    const disposition =
      response.headers.get('content-disposition') ??
      'attachment; filename="document.pdf"';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Content-Length', String(buffer.length));
    return res.send(buffer);
  } catch (error) {
    console.error('[documents/article-pdf]', error);
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Documenter no disponible',
    });
  }
}
