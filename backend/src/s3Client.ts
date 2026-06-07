import { S3_INTERNAL_TOKEN, S3_URL } from './constants/index.js';

const INTERNAL_HEADER = 'X-S3-Internal-Token';

export interface S3FolderEntry {
  name: string;
  prefix: string;
}

export interface S3ObjectEntry {
  key: string;
  name: string;
  url: string;
  size: number;
  content_type?: string;
  last_modified: string;
}

export interface S3ListResult {
  ok: boolean;
  prefix: string;
  folders: S3FolderEntry[];
  objects: S3ObjectEntry[];
}

function s3Base(): string | null {
  const base = S3_URL.trim().replace(/\/+$/g, '');
  return base || null;
}

async function s3Fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = s3Base();
  if (!base) {
    throw new Error('S3_URL is not configured');
  }
  if (!S3_INTERNAL_TOKEN) {
    throw new Error('S3_INTERNAL_TOKEN is not configured');
  }

  const headers = new Headers(init.headers);
  headers.set(INTERNAL_HEADER, S3_INTERNAL_TOKEN);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `S3 API error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function isS3Configured(): boolean {
  return Boolean(s3Base() && S3_INTERNAL_TOKEN);
}

export async function fetchS3List(prefix = ''): Promise<S3ListResult> {
  const params = new URLSearchParams();
  if (prefix.trim()) {
    params.set('prefix', prefix.trim());
  }
  const query = params.toString();
  return s3Fetch<S3ListResult>(query ? `/list?${query}` : '/list');
}

export async function fetchS3ObjectURL(key: string): Promise<{ ok: boolean; key: string; url: string }> {
  const params = new URLSearchParams({ key });
  return s3Fetch(`/url?${params.toString()}`);
}

export async function fetchS3ObjectStream(key: string): Promise<Response> {
  const base = s3Base();
  if (!base || !S3_INTERNAL_TOKEN) {
    throw new Error('S3 service is not configured');
  }

  const params = new URLSearchParams({ key });
  return fetch(`${base}/object?${params.toString()}`, {
    headers: {
      [INTERNAL_HEADER]: S3_INTERNAL_TOKEN,
    },
  });
}

export async function uploadS3File(
  file: Buffer,
  filename: string,
  contentType: string,
  prefix = '',
): Promise<{
  ok: boolean;
  key: string;
  url: string;
  size: number;
  content_type: string;
}> {
  const base = s3Base();
  if (!base || !S3_INTERNAL_TOKEN) {
    throw new Error('S3 service is not configured');
  }

  const form = new FormData();
  form.append(
    'file',
    new Blob([Uint8Array.from(file)], { type: contentType }),
    filename,
  );
  if (prefix.trim()) {
    form.append('prefix', prefix.trim());
  }

  const response = await fetch(`${base}/upload`, {
    method: 'POST',
    headers: {
      [INTERNAL_HEADER]: S3_INTERNAL_TOKEN,
    },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `S3 upload failed (${response.status})`;
    throw new Error(message);
  }

  return data as {
    ok: boolean;
    key: string;
    url: string;
    size: number;
    content_type: string;
  };
}
