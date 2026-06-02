/** PDFKit uses typographic points (72 pt = 1 in). */
export const PT_PER_INCH = 72;
export const MM_PER_INCH = 25.4;
export const PT_PER_MM = PT_PER_INCH / MM_PER_INCH;
export const PX_PER_INCH = 96;

export function mmToPt(mm: number): number {
  return mm * PT_PER_MM;
}

export function pxToPt(px: number, dpi = PX_PER_INCH): number {
  return (px / dpi) * PT_PER_INCH;
}

export function ptToMm(pt: number): number {
  return pt / PT_PER_MM;
}
