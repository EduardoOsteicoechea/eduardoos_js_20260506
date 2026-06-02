import type { PdfKitDocument } from '../pdfDocument.js';
import {
  getPageContext,
  renderParagraphsInBox,
  type ParagraphRenderState,
} from '../paragraphRenderer.js';
import type { ResolvedPdfOptions } from '../resolveOptions.js';
import type { PdfLayoutBox } from '../types.js';

export function layoutSingleRow(
  doc: PdfKitDocument,
  paragraphs: string[],
  options: ResolvedPdfOptions,
  initialState: ParagraphRenderState,
): void {
  const page = getPageContext(doc, options);
  const box: PdfLayoutBox = {
    xPt: options.marginsPt.left,
    yPt: initialState.yPt,
    widthPt: page.pageWidthPt - options.marginsPt.left - options.marginsPt.right,
    heightPt: page.contentBottomPt - initialState.yPt,
  };

  renderParagraphsInBox(doc, paragraphs, box, initialState, page, options);
}
