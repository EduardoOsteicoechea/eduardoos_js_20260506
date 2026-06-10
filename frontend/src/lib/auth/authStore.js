let accessToken = '';
let currentUser = null;
let bootstrapPromise = null;

const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken() {
  return accessToken;
}

export function getAuthUser() {
  return currentUser;
}

export function isAuthenticated() {
  return Boolean(accessToken && currentUser);
}

export function hasRole(role) {
  return Boolean(currentUser?.roles?.includes(role));
}

export function canEdit() {
  return hasRole('editor') || hasRole('admin');
}

function setSession(nextToken, user) {
  accessToken = String(nextToken ?? '').trim();
  currentUser = user ?? null;
  notify();
}

export function clearSession() {
  accessToken = '';
  currentUser = null;
  notify();
}

async function authFetch(path, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function refreshAuthSession() {
  const { response, data } = await authFetch('/api/auth/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  setSession(data.accessToken, data.user);
  return data;
}

export async function ensureAuthBootstrapped() {
  if (accessToken && currentUser) return currentUser;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const session = await refreshAuthSession();
      return session?.user ?? null;
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}

export async function login(email, password) {
  const { response, data } = await authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo iniciar sesión');
  }

  setSession(data.accessToken, data.user);
  return data.user;
}

export async function register(input) {
  const { response, data } = await authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo registrar la cuenta');
  }

  setSession(data.accessToken, data.user);
  return data.user;
}

export async function logout() {
  await authFetch('/api/auth/logout', { method: 'POST' });
  clearSession();
}

export async function fetchProfile() {
  const { response, data } = await authFetch('/api/auth/profile');
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo cargar el perfil');
  }
  setSession(accessToken, data.user);
  return data.user;
}

export async function updateProfile(input) {
  const { response, data } = await authFetch('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo actualizar el perfil');
  }

  setSession(data.accessToken ?? accessToken, data.user);
  return data.user;
}

export async function validateEmail(token) {
  const { response, data } = await authFetch('/api/auth/validate-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(data.error || 'Token inválido o caducado');
  }

  if (currentUser?.id === data.user?.id) {
    setSession(accessToken, data.user);
  }

  return data.user;
}

export async function resendVerification(email) {
  const { response, data } = await authFetch('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo reenviar el correo');
  }

  return data;
}

export async function forgotPassword(email) {
  const { response, data } = await authFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo enviar el correo');
  }

  return data;
}

export async function resetPassword(token, password) {
  const { response, data } = await authFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo restablecer la contraseña');
  }

  return data.user;
}

export async function authorizedFetch(path, init = {}) {
  await ensureAuthBootstrapped();

  let { response, data } = await authFetch(path, init);
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      ({ response, data } = await authFetch(path, init));
    }
  }

  return { response, data };
}
