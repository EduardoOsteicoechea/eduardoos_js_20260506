export type PaperSize = 'letter';
export type LayoutMode = 'single-row' | 'two-row';

export interface MarginsMm {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PdfStyleOptions {
  marginsMm?: Partial<MarginsMm>;
  paragraphGapMm?: number;
  lineGapMm?: number;
  columnGapMm?: number;
  fontSizePt?: number;
}

export interface PdfColumnContent {
  left?: string[];
  right?: string[];
}

export interface PdfGenerateInput {
  paperSize: PaperSize;
  layout: LayoutMode;
  title?: string;
  paragraphs?: string[];
  columns?: PdfColumnContent;
  options?: PdfStyleOptions;
}

export interface PdfLayoutBox {
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
}

export interface PdfPageContext {
  contentTopPt: number;
  contentBottomPt: number;
  pageWidthPt: number;
  pageHeightPt: number;
}
