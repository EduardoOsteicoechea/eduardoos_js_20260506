export function buildMediaProxyUrl(key: string): string {
  const clean = String(key ?? '').trim();
  if (!clean) return '';
  return `/api/media/object?key=${encodeURIComponent(clean)}`;
}

export function proxyUrlForS3List<T extends { objects?: Array<{ key: string; url: string }> }>(
  result: T,
): T {
  if (!Array.isArray(result.objects)) return result;
  return {
    ...result,
    objects: result.objects.map((object) => ({
      ...object,
      url: buildMediaProxyUrl(object.key),
    })),
  };
}
