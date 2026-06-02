import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { SERIES_DATA_ROOT } from './constants/index.js';

const MEDIA_BLOCK_KEYS = ['image', 'video', 'audio'] as const;

type MediaKey = (typeof MEDIA_BLOCK_KEYS)[number];

interface PostEditorSection {
  heading?: string;
  content?: unknown[];
}

interface PostEditorPayload {
  serie?: string;
  series?: string;
  chapter?: string;
  section?: string;
  article_id?: string;
  folder_name?: string;
  title: string;
  creator?: string;
  posts?: unknown[];
  sections: PostEditorSection[];
}

interface PersistResult {
  storagePath: string;
  dataPath: string;
  assetCount: number;
  sectionArticleId: number;
}

interface SectionMetadataPost {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

interface SectionMetadata {
  series?: string;
  section?: string;
  posts?: SectionMetadataPost[];
  [key: string]: unknown;
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function requirePathSegment(raw: unknown, fieldName: string): string {
  const value = sanitizeSegment(String(raw ?? ''));
  if (!value) {
    throw new Error(`Campo inválido: ${fieldName}`);
  }
  return value;
}

function buildFileLookup(files: Express.Multer.File[]): Map<string, Express.Multer.File[]> {
  const byName = new Map<string, Express.Multer.File[]>();

  for (const file of files) {
    const keys = new Set([
      basename(file.originalname),
      basename(file.filename || ''),
      basename(file.fieldname || ''),
    ]);

    for (const key of keys) {
      if (!key) continue;
      const list = byName.get(key) ?? [];
      list.push(file);
      byName.set(key, list);
    }
  }

  return byName;
}

function pullUpload(
  lookup: Map<string, Express.Multer.File[]>,
  key: string,
): Express.Multer.File | undefined {
  const list = lookup.get(key);
  if (!list?.length) return undefined;
  return list.shift();
}

function detectMediaKey(block: Record<string, unknown>): MediaKey | null {
  for (const key of MEDIA_BLOCK_KEYS) {
    if (typeof block[key] === 'string' || typeof block.fileName === 'string') {
      return key;
    }
  }
  return null;
}

function ensurePayload(payload: unknown): PostEditorPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Cuerpo JSON inválido');
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.title !== 'string' || !Array.isArray(record.sections)) {
    throw new Error('El artículo debe incluir title y sections');
  }

  return {
    serie: typeof record.serie === 'string' ? record.serie : undefined,
    series: typeof record.series === 'string' ? record.series : undefined,
    chapter: typeof record.chapter === 'string' ? record.chapter : undefined,
    section: typeof record.section === 'string' ? record.section : undefined,
    article_id: typeof record.article_id === 'string' ? record.article_id : undefined,
    folder_name: typeof record.folder_name === 'string' ? record.folder_name : undefined,
    creator: typeof record.creator === 'string' ? record.creator : undefined,
    posts: Array.isArray(record.posts) ? record.posts : undefined,
    title: record.title,
    sections: record.sections as PostEditorSection[],
  };
}

async function upsertSectionMetadataPost(
  root: string,
  serie: string,
  chapter: string,
  folderName: string,
  title: string,
): Promise<number> {
  const chapterDir = join(root, serie, chapter);
  await mkdir(chapterDir, { recursive: true });

  const metadataPath = join(root, serie, chapter, 'data.json');
  let metadata: SectionMetadata = {
    series: serie,
    section: chapter,
    posts: [],
  };

  try {
    const raw = await readFile(metadataPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      metadata = {
        ...metadata,
        ...(parsed as SectionMetadata),
      };
    }
  } catch {
    // create if missing/invalid
  }

  const posts = Array.isArray(metadata.posts) ? metadata.posts : [];
  const existingIndex = posts.findIndex((post) => post?.name === folderName);
  const maxId = posts.reduce((currentMax, post) => {
    const id = Number(post?.id);
    return Number.isFinite(id) ? Math.max(currentMax, id) : currentMax;
  }, 0);

  const assignedId =
    existingIndex >= 0
      ? Number(posts[existingIndex]?.id) || maxId + 1
      : maxId + 1;

  const currentPost = existingIndex >= 0 ? posts[existingIndex] : {};
  const updatedPost: SectionMetadataPost = {
    ...currentPost,
    id: assignedId,
    name: folderName,
    title: title.trim(),
  };

  if (existingIndex >= 0) {
    posts[existingIndex] = updatedPost;
  } else {
    posts.push(updatedPost);
  }

  metadata.posts = posts;
  metadata.series = String(metadata.series ?? serie);
  metadata.section = String(metadata.section ?? chapter);

  await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  return assignedId;
}

export async function persistPostEditorPayload(
  payloadInput: unknown,
  uploadedFiles: Express.Multer.File[],
  root = SERIES_DATA_ROOT,
): Promise<PersistResult> {
  const payload = ensurePayload(payloadInput);

  const serie = requirePathSegment(payload.serie, 'serie');
  const chapter = requirePathSegment(payload.chapter, 'chapter');
  const folderName = requirePathSegment(
    payload.folder_name ?? payload.article_id,
    'folder_name',
  );
  const sectionArticleId = await upsertSectionMetadataPost(
    root,
    serie,
    chapter,
    folderName,
    payload.title,
  );

  const articleDir = join(root, serie, chapter, folderName);
  await mkdir(articleDir, { recursive: true });

  const fileLookup = buildFileLookup(uploadedFiles);
  let assetCount = 0;

  for (const section of payload.sections) {
    if (!Array.isArray(section.content)) continue;

    for (const block of section.content) {
      if (!block || typeof block !== 'object') continue;

      const blockRecord = block as Record<string, unknown>;
      const mediaKey = detectMediaKey(blockRecord);
      if (!mediaKey) continue;

      const fileNameRaw = String(blockRecord.fileName ?? '').trim();
      if (!fileNameRaw) continue;

      const safeFileName = basename(fileNameRaw);
      const upload = pullUpload(fileLookup, safeFileName);
      if (!upload) continue;

      const destinationPath = join(articleDir, safeFileName);
      await writeFile(destinationPath, upload.buffer);
      assetCount += 1;

      blockRecord[mediaKey] = `/data/series/${serie}/${chapter}/${folderName}/${safeFileName}`;
      delete blockRecord.fileName;
    }
  }

  const dataPath = join(articleDir, 'data.json');
  await writeFile(dataPath, JSON.stringify(payload, null, 2), 'utf-8');

  return {
    storagePath: `${serie}/${chapter}/${folderName}`,
    dataPath,
    assetCount,
    sectionArticleId,
  };
}
