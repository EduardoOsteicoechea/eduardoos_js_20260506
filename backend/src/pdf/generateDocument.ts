import { PassThrough } from 'node:stream';
import { PDFDocument, type PdfKitDocument } from './pdfDocument.js';
import { getPaperDimensions } from './paperSizes.js';
import { layoutSingleRow } from './layouts/singleRowLayout.js';
import { layoutTwoRow } from './layouts/twoRowLayout.js';
import { normalizeGenerateInput, resolvePdfOptions } from './resolveOptions.js';
import {
  getPageContext,
  renderTitle,
  type ParagraphRenderState,
} from './paragraphRenderer.js';
import type { PdfGenerateInput } from './types.js';

function documentToBuffer(doc: PdfKitDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = doc.pipe(new PassThrough());

    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    doc.on('error', reject);

    doc.end();
  });
}

export async function generatePdfDocument(input: PdfGenerateInput): Promise<Buffer> {
  const payload = normalizeGenerateInput(input);
  const paper = getPaperDimensions(payload.paperSize);
  const options = resolvePdfOptions(payload.options);

  const doc = new PDFDocument({
    size: [paper.widthPt, paper.heightPt],
    margin: 0,
    autoFirstPage: true,
  });

  const state: ParagraphRenderState = { yPt: options.marginsPt.top };
  const page = getPageContext(doc, options);

  if (payload.title) {
    renderTitle(doc, payload.title, page, options, state);
  }

  if (payload.layout === 'single-row') {
    layoutSingleRow(doc, payload.paragraphs ?? [], options, state);
  } else {
    layoutTwoRow(
      doc,
      {
        left: payload.columns?.left,
        right: payload.columns?.right,
      },
      options,
      state,
    );
  }

  return documentToBuffer(doc);
}
