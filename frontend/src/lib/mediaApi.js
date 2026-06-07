export async function listMedia(prefix = '') {
  const params = new URLSearchParams();
  if (prefix.trim()) params.set('prefix', prefix.trim());

  const query = params.toString();
  const response = await fetch(query ? `/api/media/list?${query}` : '/api/media/list');
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? `No se pudo listar media (${response.status})`);
  }

  return data;
}

export async function uploadMedia(file, { prefix = '', password = '' } = {}) {
  if (!password.trim()) {
    throw new Error('Se requiere la contraseña del editor para subir archivos');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('password', password.trim());
  if (prefix.trim()) form.append('prefix', prefix.trim());

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error ?? `No se pudo subir el archivo (${response.status})`);
  }

  return data;
}
