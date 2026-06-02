import type { Request, Response } from 'express';
import {
  generatePdfDocument,
  pdfGenerateBodySchema,
  SUPPORTED_PAPER_SIZES,
} from '../pdf/index.js';

export function getPdfCapabilities(_req: Request, res: Response) {
  return res.json({
    ok: true,
    paperSizes: SUPPORTED_PAPER_SIZES,
    layouts: ['single-row', 'two-row'],
    units: {
      positioning: ['mm', 'pt', 'px'],
      note: 'El motor convierte mm y px a puntos PDF (72 pt = 1 in).',
    },
  });
}

export async function generatePdf(req: Request, res: Response) {
  try {
    const parsed = pdfGenerateBodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'Payload inválido',
        details: parsed.error.flatten(),
      });
    }

    const pdfBuffer = await generatePdfDocument(parsed.data);
    const filename =
      typeof req.query.filename === 'string' && req.query.filename.trim()
        ? req.query.filename.trim().replace(/[^\w.-]+/g, '_')
        : 'document';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('[pdf/generate]', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo generar el PDF',
    });
  }
}
