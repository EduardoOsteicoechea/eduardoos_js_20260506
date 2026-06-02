import PDFDocument from 'pdfkit';
import { PassThrough } from 'node:stream';
import type { ArticlePayload } from './types.js';

function toParagraph(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractBlockText(block: unknown): string[] {
  if (!block || typeof block !== 'object') return [];
  const record = block as Record<string, unknown>;

  if (typeof record.paragraph === 'string') return [record.paragraph];
  if (typeof record.heading === 'string') return [record.heading];
  if (typeof record.quote === 'string') return [record.quote];

  if (Array.isArray(record.list)) {
    return record.list
      .map((item) => {
        if (typeof item === 'string') return `• ${item}`;
        if (!item || typeof item !== 'object') return '';
        const itemRecord = item as Record<string, unknown>;
        const content = toParagraph(itemRecord.content);
        const emphasized = toParagraph(itemRecord.emphasized);
        const merged = [content, emphasized].filter(Boolean).join(' ');
        return merged ? `• ${merged}` : '';
      })
      .filter(Boolean);
  }

  if (typeof record.text === 'string') {
    const href = toParagraph(record.href);
    return [href ? `${record.text} (${href})` : record.text];
  }

  return [];
}

function collectParagraphs(payload: ArticlePayload): string[] {
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  const paragraphs: string[] = [];

  for (const section of sections) {
    const heading = toParagraph(section.heading);
    if (heading) paragraphs.push(heading);

    const content = Array.isArray(section.content) ? section.content : [];
    for (const block of content) {
      paragraphs.push(...extractBlockText(block));
    }
  }

  return paragraphs.filter(Boolean);
}

function bufferFromDocument(doc: PDFKit.PDFDocument): Promise<Buffer> {
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

export async function generateArticlePdf(payload: ArticlePayload): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 64, left: 64, right: 64, bottom: 64 },
  });

  const title = toParagraph(payload.title) || 'Documento';
  const creator = toParagraph(payload.creator);
  const paragraphs = collectParagraphs(payload);

  doc.fontSize(20).text(title, { align: 'left' });
  if (creator) {
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4b5563').text(`Autor: ${creator}`);
    doc.fillColor('#111111');
  }

  doc.moveDown(1);
  doc.fontSize(11);

  if (!paragraphs.length) {
    doc.text('Sin contenido.');
  } else {
    for (const paragraph of paragraphs) {
      doc.text(paragraph, { width: 470, lineGap: 3 });
      doc.moveDown(0.6);
    }
  }

  return bufferFromDocument(doc);
}
