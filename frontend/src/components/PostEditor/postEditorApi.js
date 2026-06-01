export async function validateEditorPassword(password) {
  const response = await fetch('/api/auth/post/editor/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function savePostPayload(payload) {
  const response = await fetch('/api/post/editor/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}
