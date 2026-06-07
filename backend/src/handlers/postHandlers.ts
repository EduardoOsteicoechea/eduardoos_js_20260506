import type { Request, Response } from 'express';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';
import { requestFrontendRebuild } from '../deployHook.js';
import {
  isPostsDbConfigured,
  savePostsDbArticle,
} from '../postsDbClient.js';

function readEditorPassword(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  return String((body as { password?: string }).password ?? '').trim();
}

function isEditorPasswordValid(password: string): boolean {
  return Boolean(password) && password === POST_EDITOR_PASSWORD;
}

export function validatePostEditorPassword(req: Request, res: Response) {
  const password = readEditorPassword(req.body);

  if (!isEditorPasswordValid(password)) {
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
      const unitType =
        typeof record.type === 'string' ? record.type.trim() : '';

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

      if (unitType) {
        record.type = unitType;
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

function readSavePayload(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    throw new Error('Cuerpo JSON inválido');
  }

  const record = body as { payload?: unknown };
  if (record.payload == null) {
    return body;
  }

  return typeof record.payload === 'string'
    ? JSON.parse(record.payload)
    : record.payload;
}

export async function savePostEditorArticle(req: Request, res: Response) {
  if (!isPostsDbConfigured()) {
    return res.status(503).json({
      ok: false,
      error: 'Posts database is not configured',
    });
  }

  const password = readEditorPassword(req.body);
  if (!isEditorPasswordValid(password)) {
    return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
  }

  try {
    const rawPayload = readSavePayload(req.body);
    const payload = normalizeMediaUrls(ensureArticlePayload(rawPayload));
    const result = await savePostsDbArticle(payload);
    void requestFrontendRebuild().catch((error) => {
      console.warn('[post/editor] frontend rebuild hook failed:', error);
    });

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
