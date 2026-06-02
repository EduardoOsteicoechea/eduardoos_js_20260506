import type { PdfKitDocument } from '../pdfDocument.js';
import {
  getPageContext,
  renderParagraphsInBox,
  type ParagraphRenderState,
} from '../paragraphRenderer.js';
import type { ResolvedPdfOptions } from '../resolveOptions.js';
import type { PdfColumnContent, PdfLayoutBox } from '../types.js';

function buildColumnBox(
  doc: PdfKitDocument,
  side: 'left' | 'right',
  options: ResolvedPdfOptions,
  startYPt: number,
): PdfLayoutBox {
  const page = getPageContext(doc, options);
  const contentWidth =
    page.pageWidthPt - options.marginsPt.left - options.marginsPt.right;
  const columnWidth = (contentWidth - options.columnGapPt) / 2;
  const xPt =
    side === 'left'
      ? options.marginsPt.left
      : options.marginsPt.left + columnWidth + options.columnGapPt;

  return {
    xPt,
    yPt: startYPt,
    widthPt: columnWidth,
    heightPt: page.contentBottomPt - startYPt,
  };
}

/** Two columns side by side; each column wraps paragraphs independently. */
export function layoutTwoRow(
  doc: PdfKitDocument,
  columns: PdfColumnContent,
  options: ResolvedPdfOptions,
  initialState: ParagraphRenderState,
): void {
  const page = getPageContext(doc, options);
  const leftState: ParagraphRenderState = { yPt: initialState.yPt };
  const rightState: ParagraphRenderState = { yPt: initialState.yPt };

  const leftParagraphs = columns.left ?? [];
  const rightParagraphs = columns.right ?? [];

  if (leftParagraphs.length) {
    renderParagraphsInBox(
      doc,
      leftParagraphs,
      buildColumnBox(doc, 'left', options, leftState.yPt),
      leftState,
      page,
      options,
    );
  }

  if (rightParagraphs.length) {
    renderParagraphsInBox(
      doc,
      rightParagraphs,
      buildColumnBox(doc, 'right', options, rightState.yPt),
      rightState,
      page,
      options,
    );
  }

  initialState.yPt = Math.max(leftState.yPt, rightState.yPt);
}
