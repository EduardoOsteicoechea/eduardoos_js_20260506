import type { Request, Response } from 'express';
import multer from 'multer';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';
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

function readEditorPassword(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  return String((body as { password?: string }).password ?? '').trim();
}

function isEditorPasswordValid(password: string): boolean {
  return Boolean(password) && password === POST_EDITOR_PASSWORD;
}

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
    const prefix = String(req.query.prefix ?? '').trim();
    const result = proxyUrlForS3List(await fetchS3List(prefix));
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

    const password = readEditorPassword(req.body);
    if (!isEditorPasswordValid(password)) {
      return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'file es obligatorio' });
    }

    try {
      const prefix = String(req.body.prefix ?? '').trim();
      const result = await uploadS3File(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype || 'application/octet-stream',
        prefix,
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
