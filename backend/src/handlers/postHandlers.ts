import type { Request, Response } from 'express';
import { persistPostEditorPayload } from '../postEditorStorage.js';
import { DOCUMENTER_URL, POST_EDITOR_PASSWORD } from '../constants/index.js';

async function requestDocumenterPdf(payload: unknown) {
  const response = await fetch(
    `${DOCUMENTER_URL.replace(/\/+$/g, '')}/documents/article-pdf`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : 'Falló la generación de PDF',
    );
  }
  return data;
}

export function validatePostEditorPassword(req: Request, res: Response) {
  const { password } = req.body as { password?: string };

  if (!password || password !== POST_EDITOR_PASSWORD) {
    return res.status(401).json({ valid: false, error: 'Contraseña incorrecta' });
  }

  return res.json({ valid: true });
}

export async function savePostEditorArticle(req: Request, res: Response) {
  try {
    const rawPayload = typeof req.body?.payload === 'string'
      ? JSON.parse(req.body.payload)
      : req.body;
    const files = Array.isArray(req.files) ? req.files : [];

    const result = await persistPostEditorPayload(rawPayload, files);
    let pdfResult: unknown = null;
    let pdfWarning: string | null = null;

    try {
      pdfResult = await requestDocumenterPdf(rawPayload);
    } catch (error) {
      pdfWarning = error instanceof Error ? error.message : 'No se pudo generar el PDF';
      console.error('[post/editor][pdf]', error);
    }

    return res.json({
      ok: true,
      message: 'Artículo almacenado',
      path: result.storagePath,
      assets: result.assetCount,
      section_article_id: result.sectionArticleId,
      pdf: pdfResult,
      pdf_warning: pdfWarning,
    });
  } catch (error) {
    console.error('[post/editor]', error);
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo guardar el artículo',
    });
  }
}
