import type { Request, Response } from 'express';
import {
  fetchPostsDbArticles,
  fetchPostsDbCatalog,
  isPostsDbConfigured,
} from '../postsDbClient.js';
import {
  buildSeriesCatalog,
  getNextArticleId,
  listSeriesArticles,
  readSeriesArticle,
} from '../seriesCatalog.js';

function postsDbUnavailable(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[series] posts-db unavailable, using filesystem fallback: ${message}`);
}

export async function getSeriesCatalog(_req: Request, res: Response) {
  try {
    if (isPostsDbConfigured()) {
      try {
        const catalog = await fetchPostsDbCatalog();
        return res.json(catalog);
      } catch (dbError) {
        postsDbUnavailable(dbError);
      }
    }

    const catalog = await buildSeriesCatalog();
    return res.json(catalog);
  } catch (error) {
    console.error('[series/catalog]', error);
    return res.status(500).json({ error: 'No se pudo cargar el catálogo de series' });
  }
}

export async function getSeriesNextArticleId(req: Request, res: Response) {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();

  if (!serie || !chapter) {
    return res.status(400).json({ error: 'serie y chapter son obligatorios' });
  }

  try {
    const next = await getNextArticleId(serie, chapter);
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

  try {
    if (isPostsDbConfigured()) {
      try {
        const articles = await fetchPostsDbArticles(serie, chapter);
        return res.json({ articles });
      } catch (dbError) {
        postsDbUnavailable(dbError);
      }
    }

    const articles = await listSeriesArticles(serie, chapter);
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

  try {
    const article = await readSeriesArticle(serie, chapter, articleId);
    return res.json({ article });
  } catch (error) {
    console.error('[series/article]', error);
    return res.status(404).json({ error: 'No se pudo cargar el artículo' });
  }
}
