import type { Request, Response } from 'express';
import { fetchPostsDbLogs, isPostsDbConfigured } from '../postsDbClient.js';

export async function getServiceLogs(req: Request, res: Response) {
  if (!isPostsDbConfigured()) {
    return res.status(503).json({
      ok: false,
      error: 'Posts DB is not configured',
    });
  }

  try {
    const service = String(req.query.service ?? '').trim();
    const level = String(req.query.level ?? '').trim();
    const limitRaw = String(req.query.limit ?? '').trim();
    const sinceIdRaw = String(req.query.since_id ?? '').trim();

    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (level) params.set('level', level);
    if (limitRaw) params.set('limit', limitRaw);
    if (sinceIdRaw) params.set('since_id', sinceIdRaw);

    const result = await fetchPostsDbLogs(params);
    return res.json(result);
  } catch (error) {
    console.error('[logs]', error);
    return res.status(500).json({
      ok: false,
      error: 'No se pudieron cargar los logs',
    });
  }
}
