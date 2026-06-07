import type { Request, Response } from 'express';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';
import { requestFrontendRebuild } from '../deployHook.js';
import {
  isPostsDbConfigured,
  savePostsDbCatalogEntry,
} from '../postsDbClient.js';

function readEditorPassword(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  return String((body as { password?: string }).password ?? '').trim();
}

function isEditorPasswordValid(password: string): boolean {
  return Boolean(password) && password === POST_EDITOR_PASSWORD;
}

export async function saveCatalogMetadata(req: Request, res: Response) {
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

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const seriesSlug = String(
    (body as { series_slug?: string; serie?: string }).series_slug ??
      (body as { serie?: string }).serie ??
      '',
  ).trim();
  const seriesName = String(
    (body as { series_name?: string }).series_name ?? '',
  ).trim();
  const chapter = String((body as { chapter?: string }).chapter ?? '').trim();
  const hub =
    (body as { hub?: Record<string, unknown> }).hub &&
    typeof (body as { hub?: Record<string, unknown> }).hub === 'object'
      ? ((body as { hub: Record<string, unknown> }).hub as Record<string, unknown>)
      : undefined;

  if (!seriesSlug) {
    return res.status(400).json({
      ok: false,
      error: 'series_slug es obligatorio',
    });
  }

  try {
    const result = await savePostsDbCatalogEntry({
      series_slug: seriesSlug,
      series_name: seriesName,
      chapter,
      hub,
    });

    void requestFrontendRebuild().catch((error) => {
      console.warn('[catalog/save] frontend rebuild hook failed:', error);
    });

    return res.json({
      ok: true,
      series_slug: result.series_slug,
      chapter: result.chapter,
    });
  } catch (error) {
    console.error('[catalog/save]', error);
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el catálogo',
    });
  }
}
