import { z } from 'zod';
import { uploadS3Buffer, isS3Configured } from '../s3Client.js';
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
): Promise<PersistedPdfResult> {
  if (!isS3Configured()) {
    throw new Error('S3 service is not configured for documenter');
  }

  const payload = normalizePayload(payloadInput);

  const serie = requireSegment(payload.serie ?? payload.series, 'serie');
  const chapter = requireSegment(payload.chapter ?? payload.section, 'chapter');
  const folder = requireSegment(
    payload.folder_name ?? payload.article_id,
    'folder_name',
  );

  const pdfBuffer = await generateArticlePdf(payload);
  const prefix = `documents/${serie}/${chapter}/${folder}`;
  const uploaded = await uploadS3Buffer(
    pdfBuffer,
    'document.pdf',
    prefix,
    'application/pdf',
  );

  return {
    storagePath: `${serie}/${chapter}/${folder}`,
    key: uploaded.key,
    url: uploaded.url,
    publicPath: uploaded.url,
    bytes: uploaded.size,
  };
}
