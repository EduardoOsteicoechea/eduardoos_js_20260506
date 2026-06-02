import type { Request, Response } from 'express';
import { readFile } from 'node:fs/promises';
import { persistArticlePdf } from '../pdf/storage.js';

function pdfFilenameFromPayload(body: unknown): string {
  const title =
    body && typeof body === 'object' && 'title' in body
      ? String((body as { title?: string }).title ?? '').trim()
      : '';
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return safe ? `${safe}.pdf` : 'document.pdf';
}

export async function generateArticlePdfHandler(req: Request, res: Response) {
  try {
    const download =
      req.query.download === '1' ||
      req.query.download === 'true' ||
      String(req.headers.accept ?? '').includes('application/pdf');

    const result = await persistArticlePdf(req.body);

    if (download) {
      const pdfBuffer = await readFile(result.absolutePath);
      const filename = pdfFilenameFromPayload(req.body);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', String(pdfBuffer.length));
      return res.send(pdfBuffer);
    }

    return res.json({
      ok: true,
      message: 'PDF generado',
      ...result,
    });
  } catch (error) {
    console.error('[documenter/pdf]', error);
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo generar el PDF',
    });
  }
}
