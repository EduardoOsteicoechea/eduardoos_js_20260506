import type { Request, Response } from 'express';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';
import {
  isPostsDbConfigured,
  savePostsDbArticle,
} from '../postsDbClient.js';

export function validatePostEditorPassword(req: Request, res: Response) {
  const { password } = req.body as { password?: string };

  if (!password || password !== POST_EDITOR_PASSWORD) {
    return res.status(401).json({ valid: false, error: 'Contraseña incorrecta' });
  }

  return res.json({ valid: true });
}

function ensureArticlePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Cuerpo JSON inválido');
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.title !== 'string' || !Array.isArray(record.sections)) {
    throw new Error('El artículo debe incluir title y sections');
  }

  return record;
}

function normalizeMediaUrls(payload: Record<string, unknown>): Record<string, unknown> {
  const sections = Array.isArray(payload.sections) ? payload.sections : [];

  const normalizedSections = sections.map((section) => {
    if (!section || typeof section !== 'object') return section;
    const sectionRecord = section as Record<string, unknown>;
    const content = Array.isArray(sectionRecord.content) ? sectionRecord.content : [];

    const normalizedContent = content.map((block) => {
      if (!block || typeof block !== 'object') return block;
      const record = { ...(block as Record<string, unknown>) };

      for (const key of ['image', 'video', 'audio'] as const) {
        if (typeof record[key] !== 'string') continue;
        const url = record[key].trim();
        if (!url) {
          delete record[key];
          continue;
        }
        record[key] = url;
        const name =
          typeof record.name === 'string' && record.name.trim()
            ? record.name.trim()
            : typeof record.fileName === 'string' && record.fileName.trim()
              ? record.fileName.trim()
              : '';
        if (name) {
          record.name = name;
        }
        delete record.fileName;
      }

      return record;
    });

    return {
      ...sectionRecord,
      content: normalizedContent,
    };
  });

  return {
    ...payload,
    sections: normalizedSections,
  };
}

export async function savePostEditorArticle(req: Request, res: Response) {
  if (!isPostsDbConfigured()) {
    return res.status(503).json({
      ok: false,
      error: 'Posts database is not configured',
    });
  }

  try {
    const rawPayload =
      typeof req.body?.payload === 'string'
        ? JSON.parse(req.body.payload)
        : req.body;

    const payload = normalizeMediaUrls(ensureArticlePayload(rawPayload));
    const result = await savePostsDbArticle(payload);

    return res.json({
      ok: true,
      message: 'Artículo almacenado',
      path: result.path,
      assets: 0,
      section_article_id: result.section_article_id,
      post_id: result.post_id,
    });
  } catch (error) {
    console.error('[post/editor]', error);
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo guardar el artículo',
    });
  }
}
