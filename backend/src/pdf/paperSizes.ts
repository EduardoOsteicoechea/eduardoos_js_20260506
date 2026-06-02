import type { PaperSize } from './types.js';
import { mmToPt } from './units.js';

export interface PaperDimensions {
  widthPt: number;
  heightPt: number;
  widthMm: number;
  heightMm: number;
}

/** US Letter — 8.5 × 11 in */
const LETTER_MM: PaperDimensions = {
  widthMm: 215.9,
  heightMm: 279.4,
  widthPt: mmToPt(215.9),
  heightPt: mmToPt(279.4),
};

const PAPER_BY_SIZE: Record<PaperSize, PaperDimensions> = {
  letter: LETTER_MM,
};

export function getPaperDimensions(paperSize: PaperSize): PaperDimensions {
  const dimensions = PAPER_BY_SIZE[paperSize];
  if (!dimensions) {
    throw new Error(`Tamaño de papel no soportado: ${paperSize}`);
  }
  return dimensions;
}

export const SUPPORTED_PAPER_SIZES: PaperSize[] = ['letter'];
