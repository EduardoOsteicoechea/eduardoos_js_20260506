import type { PdfKitDocument } from './pdfDocument.js';
import type { PdfLayoutBox, PdfPageContext } from './types.js';
import type { ResolvedPdfOptions } from './resolveOptions.js';

export interface ParagraphRenderState {
  yPt: number;
}

export function getPageContext(
  doc: PdfKitDocument,
  options: ResolvedPdfOptions,
): PdfPageContext {
  return {
    pageWidthPt: doc.page.width,
    pageHeightPt: doc.page.height,
    contentTopPt: options.marginsPt.top,
    contentBottomPt: doc.page.height - options.marginsPt.bottom,
  };
}

export function ensureSpace(
  doc: PdfKitDocument,
  state: ParagraphRenderState,
  page: PdfPageContext,
  requiredHeightPt: number,
): void {
  if (state.yPt + requiredHeightPt <= page.contentBottomPt) return;

  doc.addPage({ size: doc.page.size as string, margin: 0 });
  state.yPt = page.contentTopPt;
}

export function renderParagraphsInBox(
  doc: PdfKitDocument,
  paragraphs: string[],
  box: PdfLayoutBox,
  state: ParagraphRenderState,
  page: PdfPageContext,
  options: ResolvedPdfOptions,
): void {
  doc.fontSize(options.fontSizePt);

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (!paragraph) continue;

    const estimatedHeight =
      doc.heightOfString(paragraph, {
        width: box.widthPt,
        lineGap: options.lineGapPt,
      }) + options.paragraphGapPt;

    ensureSpace(doc, state, page, estimatedHeight);

    const y = Math.max(state.yPt, box.yPt);
    doc.text(paragraph, box.xPt, y, {
      width: box.widthPt,
      lineGap: options.lineGapPt,
      align: 'left',
    });

    state.yPt = doc.y + options.paragraphGapPt;
  }
}

export function renderTitle(
  doc: PdfKitDocument,
  title: string,
  page: PdfPageContext,
  options: ResolvedPdfOptions,
  state: ParagraphRenderState,
): void {
  const titleSize = options.fontSizePt + 4;
  doc.fontSize(titleSize);
  const titleHeight =
    doc.heightOfString(title, {
      width: page.pageWidthPt - options.marginsPt.left - options.marginsPt.right,
    }) + options.paragraphGapPt;

  ensureSpace(doc, state, page, titleHeight);

  doc.text(title, options.marginsPt.left, state.yPt, {
    width: page.pageWidthPt - options.marginsPt.left - options.marginsPt.right,
    align: 'left',
  });

  state.yPt = doc.y + options.paragraphGapPt;
  doc.fontSize(options.fontSizePt);
}
