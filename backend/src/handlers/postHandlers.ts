import type { Request, Response } from 'express';
import { persistPostEditorPayload } from '../postEditorStorage.js';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';

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

    return res.json({
      ok: true,
      message: 'Artículo almacenado',
      path: result.storagePath,
      assets: result.assetCount,
      section_article_id: result.sectionArticleId,
    });
  } catch (error) {
    console.error('[post/editor]', error);
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo guardar el artículo',
    });
  }
}
