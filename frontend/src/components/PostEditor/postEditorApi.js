import { authorizedFetch } from '../../lib/auth/authStore';

export async function savePostPayload(payload) {
  const { response, data } = await authorizedFetch('/api/post/editor/', {
    method: 'POST',
    body: JSON.stringify({ payload }),
  });

  return { response, data };
}

export async function savePostPayloadWithAssets(payload) {
  return savePostPayload(payload);
}
