import type { MarginsMm, PdfGenerateInput, PdfStyleOptions } from './types.js';
import { mmToPt } from './units.js';

const DEFAULT_MARGINS_MM: MarginsMm = {
  top: 25.4,
  right: 25.4,
  bottom: 25.4,
  left: 25.4,
};

export interface ResolvedPdfOptions {
  marginsMm: MarginsMm;
  marginsPt: MarginsMm;
  paragraphGapPt: number;
  lineGapPt: number;
  columnGapPt: number;
  fontSizePt: number;
}

export function resolvePdfOptions(options?: PdfStyleOptions): ResolvedPdfOptions {
  const marginsMm: MarginsMm = {
    ...DEFAULT_MARGINS_MM,
    ...options?.marginsMm,
  };

  return {
    marginsMm,
    marginsPt: {
      top: mmToPt(marginsMm.top),
      right: mmToPt(marginsMm.right),
      bottom: mmToPt(marginsMm.bottom),
      left: mmToPt(marginsMm.left),
    },
    paragraphGapPt: mmToPt(options?.paragraphGapMm ?? 6),
    lineGapPt: mmToPt(options?.lineGapMm ?? 2),
    columnGapPt: mmToPt(options?.columnGapMm ?? 8),
    fontSizePt: options?.fontSizePt ?? 11,
  };
}

export function normalizeGenerateInput(body: PdfGenerateInput): PdfGenerateInput {
  return {
    ...body,
    paragraphs: body.paragraphs?.map((p) => p.trim()).filter(Boolean),
    columns: body.columns
      ? {
          left: body.columns.left?.map((p) => p.trim()).filter(Boolean),
          right: body.columns.right?.map((p) => p.trim()).filter(Boolean),
        }
      : undefined,
    title: body.title?.trim() || undefined,
  };
}
