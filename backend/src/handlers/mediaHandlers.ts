import type { Request, Response } from 'express';
import multer from 'multer';
import { POST_EDITOR_PASSWORD } from '../constants/index.js';
import {
  fetchS3List,
  fetchS3ObjectURL,
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
    const result = await fetchS3List(prefix);
    return res.json(result);
  } catch (error) {
    console.error('[media/list]', error);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo listar el contenido de S3',
    });
  }
}

export async function getMediaURL(req: Request, res: Response) {
  if (!ensureConfigured(res)) return;

  const key = String(req.query.key ?? '').trim();
  if (!key) {
    return res.status(400).json({ ok: false, error: 'key es obligatorio' });
  }

  try {
    const result = await fetchS3ObjectURL(key);
    return res.json(result);
  } catch (error) {
    console.error('[media/url]', error);
    return res.status(404).json({
      ok: false,
      error: 'No se encontró el archivo en S3',
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
        url: result.url,
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
