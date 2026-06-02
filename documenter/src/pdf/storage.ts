import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { z } from 'zod';
import { generateArticlePdf } from './generatePdf.js';
import type {
  ArticlePayload,
  ArticleSection,
  PersistedPdfResult,
} from './types.js';

const articlePayloadSchema = z.object({
  serie: z.string().optional(),
  series: z.string().optional(),
  chapter: z.string().optional(),
  section: z.string().optional(),
  article_id: z.string().optional(),
  folder_name: z.string().optional(),
  title: z.string().optional(),
  creator: z.string().optional(),
  sections: z.array(z.object({}).passthrough()).optional(),
});

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function requireSegment(raw: unknown, fieldName: string): string {
  const value = sanitizeSegment(String(raw ?? ''));
  if (!value) throw new Error(`Campo inválido: ${fieldName}`);
  return value;
}

function normalizePayload(payloadInput: unknown): ArticlePayload {
  const parsed = articlePayloadSchema.safeParse(payloadInput);
  if (!parsed.success) {
    throw new Error('Payload de artículo inválido');
  }
  const payload = payloadInput as Record<string, unknown>;
  const rawSections = Array.isArray(payload.sections) ? payload.sections : [];
  const sections: ArticleSection[] = rawSections
    .filter((item) => item && typeof item === 'object')
    .map((item) => item as ArticleSection);

  return {
    ...parsed.data,
    sections,
  };
}

export async function persistArticlePdf(
  payloadInput: unknown,
  root = join(process.cwd(), 'public/data/series'),
): Promise<PersistedPdfResult> {
  const payload = normalizePayload(payloadInput);

  const serie = requireSegment(payload.serie ?? payload.series, 'serie');
  const chapter = requireSegment(payload.chapter ?? payload.section, 'chapter');
  const folder = requireSegment(
    payload.folder_name ?? payload.article_id,
    'folder_name',
  );

  const articleDir = join(root, serie, chapter, folder);
  await mkdir(articleDir, { recursive: true });

  const pdfBuffer = await generateArticlePdf(payload);
  const filename = 'document.pdf';
  const absolutePath = join(articleDir, basename(filename));
  await writeFile(absolutePath, pdfBuffer);

  return {
    storagePath: `${serie}/${chapter}/${folder}`,
    absolutePath,
    publicPath: `/data/series/${serie}/${chapter}/${folder}/${filename}`,
    bytes: pdfBuffer.length,
  };
}
