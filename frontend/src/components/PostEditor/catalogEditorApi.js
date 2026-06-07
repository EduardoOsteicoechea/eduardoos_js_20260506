export async function saveCatalogMetadata(payload, password) {
  const response = await fetch('/api/catalog/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      password,
    }),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function fetchHubMetadata(serie, chapter) {
  const params = new URLSearchParams({ serie, chapter });
  const response = await fetch(`/api/series/hub?${params}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo cargar los metadatos del capítulo');
  }

  return data.hub && typeof data.hub === 'object' ? data.hub : {};
}
