const S3_URL = (process.env.S3_URL ?? 'http://127.0.0.1:8130').replace(/\/+$/g, '');
const S3_INTERNAL_TOKEN = process.env.S3_INTERNAL_TOKEN ?? '';

export function isS3Configured(): boolean {
  return Boolean(S3_URL && S3_INTERNAL_TOKEN);
}

export async function uploadS3Buffer(
  buffer: Buffer,
  filename: string,
  prefix: string,
  contentType: string,
): Promise<{ key: string; url: string; size: number }> {
  if (!isS3Configured()) {
    throw new Error('S3 service is not configured');
  }

  const form = new FormData();
  form.append(
    'file',
    new Blob([Uint8Array.from(buffer)], { type: contentType }),
    filename,
  );
  if (prefix.trim()) {
    form.append('prefix', prefix.trim());
  }

  const response = await fetch(`${S3_URL}/upload`, {
    method: 'POST',
    headers: {
      'X-S3-Internal-Token': S3_INTERNAL_TOKEN,
    },
    body: form,
  });

  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    key?: string;
    url?: string;
    size?: number;
    error?: string;
  };

  if (!response.ok || !data.ok || !data.key || !data.url) {
    throw new Error(data.error ?? `S3 upload failed (${response.status})`);
  }

  return {
    key: data.key,
    url: data.url,
    size: data.size ?? buffer.length,
  };
}
