import type { Request, Response } from 'express';
import {
  fetchPostsDbArticle,
  fetchPostsDbArticles,
  fetchPostsDbCatalog,
  fetchPostsDbDiscover,
  fetchPostsDbHub,
  fetchPostsDbNextArticleId,
  isPostsDbConfigured,
} from '../postsDbClient.js';

function postsDbUnavailable(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[series] posts-db unavailable: ${message}`);
}

async function loadSeriesCatalogFromDb() {
  if (!isPostsDbConfigured()) {
    return { status: 503 as const, body: { error: 'Posts database is not configured' } };
  }

  try {
    const catalog = await fetchPostsDbCatalog();
    return { status: 200 as const, body: catalog };
  } catch (error) {
    console.error('[series/catalog]', error);
    return {
      status: 500 as const,
      body: { error: 'No se pudo cargar el catálogo de series' },
    };
  }
}

/** Legacy route: flat catalog JSON from posts-db. */
export async function getSeriesCatalog(_req: Request, res: Response) {
  const result = await loadSeriesCatalogFromDb();
  return res.status(result.status).json(result.body);
}

/** Explicit DB-backed catalog (includes source metadata). */
export async function getDbSeriesCatalog(_req: Request, res: Response) {
  const result = await loadSeriesCatalogFromDb();
  if (result.status !== 200) {
    return res.status(result.status).json(result.body);
  }

  return res.json({
    source: 'posts-db',
    ...result.body,
  });
}

export async function getSeriesDiscover(_req: Request, res: Response) {
  if (!isPostsDbConfigured()) {
    return res.status(503).json({ error: 'Posts database is not configured' });
  }

  try {
    const discover = await fetchPostsDbDiscover();
    return res.json(discover);
  } catch (error) {
    console.error('[series/discover]', error);
    return res.status(500).json({ error: 'No se pudo cargar el índice de series' });
  }
}

export async function getSeriesNextArticleId(req: Request, res: Response) {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();

  if (!serie || !chapter) {
    return res.status(400).json({ error: 'serie y chapter son obligatorios' });
  }

  if (!isPostsDbConfigured()) {
    return res.status(503).json({ error: 'Posts database is not configured' });
  }

  try {
    const next = await fetchPostsDbNextArticleId(serie, chapter);
    return res.json(next);
  } catch (error) {
    console.error('[series/next-article-id]', error);
    return res.status(500).json({ error: 'No se pudo asignar el id del artículo' });
  }
}

export async function getSeriesArticles(req: Request, res: Response) {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();

  if (!serie || !chapter) {
    return res.status(400).json({ error: 'serie y chapter son obligatorios' });
  }

  if (!isPostsDbConfigured()) {
    return res.status(503).json({ error: 'Posts database is not configured' });
  }

  try {
    const articles = await fetchPostsDbArticles(serie, chapter);
    return res.json({ articles });
  } catch (error) {
    console.error('[series/articles]', error);
    return res.status(500).json({ error: 'No se pudo cargar la lista de artículos' });
  }
}

export async function getSeriesArticle(req: Request, res: Response) {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();
  const articleId = String(req.query.article_id ?? '').trim();

  if (!serie || !chapter || !articleId) {
    return res.status(400).json({
      error: 'serie, chapter y article_id son obligatorios',
    });
  }

  if (!isPostsDbConfigured()) {
    return res.status(503).json({ error: 'Posts database is not configured' });
  }

  try {
    const result = await fetchPostsDbArticle(serie, chapter, articleId);
    return res.json({
      article: result.article,
      sermon_url: result.sermon_url,
    });
  } catch (error) {
    console.error('[series/article]', error);
    return res.status(404).json({ error: 'No se pudo cargar el artículo' });
  }
}

export async function getSeriesHub(req: Request, res: Response) {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();

  if (!serie || !chapter) {
    return res.status(400).json({ error: 'serie y chapter son obligatorios' });
  }

  if (!isPostsDbConfigured()) {
    return res.status(503).json({ error: 'Posts database is not configured' });
  }

  try {
    const hub = await fetchPostsDbHub(serie, chapter);
    return res.json({ hub });
  } catch (error) {
    console.error('[series/hub]', error);
    return res.status(404).json({ error: 'No se pudo cargar el hub de la serie' });
  }
}
