import { authorizedFetch } from '../../lib/auth/authStore';

export async function saveCatalogMetadata(payload) {
  const { response, data } = await authorizedFetch('/api/catalog/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

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
