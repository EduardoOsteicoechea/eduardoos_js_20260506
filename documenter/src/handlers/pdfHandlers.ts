import type { Request, Response } from 'express';
import { persistArticlePdf } from '../pdf/storage.js';

export async function generateArticlePdfHandler(req: Request, res: Response) {
  try {
    const result = await persistArticlePdf(req.body);
    return res.json({
      ok: true,
      message: 'PDF generado',
      ...result,
    });
  } catch (error) {
    console.error('[documenter/pdf]', error);
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo generar el PDF',
    });
  }
}
