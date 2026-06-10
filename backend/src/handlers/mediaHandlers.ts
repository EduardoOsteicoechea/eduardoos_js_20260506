import type { Request, Response } from 'express';
import multer from 'multer';
import { buildMediaProxyUrl, proxyUrlForS3List } from '../mediaProxy.js';
import {
  fetchS3List,
  fetchS3ObjectStream,
  isS3Configured,
  uploadS3File,
} from '../s3Client.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function ensureConfigured(res: Response): boolean {
  if (!isS3Configured()) {
    res.status(503).json({
      ok: false,
      error: 'S3 media service is not configured',
    });
    return false;
  }
  return true;
}

export async function listMedia(req: Request, res: Response) {
  if (!ensureConfigured(res)) return;

  try {
    const result = proxyUrlForS3List(await fetchS3List());
    return res.json(result);
  } catch (error) {
    console.error('[media/list]', error);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo listar el contenido de S3',
    });
  }
}

export async function serveMediaObject(req: Request, res: Response) {
  if (!ensureConfigured(res)) return;

  const key = String(req.query.key ?? '').trim();
  if (!key) {
    return res.status(400).json({ ok: false, error: 'key es obligatorio' });
  }

  try {
    const upstream = await fetchS3ObjectStream(key);
    if (!upstream.ok) {
      return res.status(upstream.status === 404 ? 404 : 502).json({
        ok: false,
        error: 'No se encontró el archivo en S3',
      });
    }

    const contentType =
      upstream.headers.get('content-type') ?? 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    console.error('[media/object]', error);
    return res.status(502).json({
      ok: false,
      error: 'No se pudo leer el archivo desde S3',
    });
  }
}

export const uploadMedia = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!ensureConfigured(res)) return;

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'file es obligatorio' });
    }

    try {
      const result = await uploadS3File(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype || 'application/octet-stream',
      );

      return res.json({
        ok: true,
        key: result.key,
        url: buildMediaProxyUrl(result.key),
        size: result.size,
        content_type: result.content_type,
      });
    } catch (error) {
      console.error('[media/upload]', error);
      return res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo subir el archivo',
      });
    }
  },
];
