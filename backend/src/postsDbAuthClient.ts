import {
  POSTS_DB_INTERNAL_TOKEN,
  POSTS_DB_URL,
} from './constants/index.js';

const INTERNAL_HEADER = 'X-Posts-Db-Internal-Token';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface RefreshPayload {
  user_id: string;
  raw_token: string;
  token_id: string;
  family_id: string;
  expires_at: number;
}

async function postsDbAuthFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = POSTS_DB_URL.trim().replace(/\/+$/g, '');
  if (!base || !POSTS_DB_INTERNAL_TOKEN) {
    throw new Error('Posts DB auth is not configured');
  }

  const headers = new Headers(init.headers);
  headers.set(INTERNAL_HEADER, POSTS_DB_INTERNAL_TOKEN);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${base}${path}`, { ...init, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `Posts DB auth error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function registerAuthUser(input: {
  email: string;
  password: string;
  display_name?: string;
}): Promise<{ user: AuthUser; verify_token: string }> {
  const data = await postsDbAuthFetch<{
    user: AuthUser;
    verify_token: string;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return { user: data.user, verify_token: data.verify_token ?? '' };
}

export async function loginAuthUser(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const data = await postsDbAuthFetch<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function fetchAuthUser(userId: string): Promise<AuthUser> {
  const params = new URLSearchParams({ id: userId });
  const data = await postsDbAuthFetch<{ user: AuthUser }>(
    `/auth/user?${params.toString()}`,
  );
  return data.user;
}

export async function updateAuthProfile(input: {
  user_id: string;
  display_name?: string;
  password?: string;
}): Promise<AuthUser> {
  const data = await postsDbAuthFetch<{ user: AuthUser }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function verifyAuthEmail(token: string): Promise<AuthUser> {
  const data = await postsDbAuthFetch<{ user: AuthUser }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return data.user;
}

export async function resendAuthVerification(
  email: string,
): Promise<string> {
  const data = await postsDbAuthFetch<{ verify_token?: string }>(
    '/auth/resend-verification',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );
  return data.verify_token ?? '';
}

export async function createAuthPasswordReset(
  email: string,
): Promise<string> {
  const data = await postsDbAuthFetch<{ reset_token?: string }>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );
  return data.reset_token ?? '';
}

export async function resetAuthPassword(input: {
  token: string;
  password: string;
}): Promise<AuthUser> {
  const data = await postsDbAuthFetch<{ user: AuthUser }>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
  return data.user;
}

export async function issueAuthRefresh(
  userId: string,
  familyId = '',
): Promise<RefreshPayload> {
  const data = await postsDbAuthFetch<{ refresh: RefreshPayload }>(
    '/auth/refresh/issue',
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, family_id: familyId }),
    },
  );
  return data.refresh;
}

export async function rotateAuthRefresh(input: {
  token: string;
  family_id: string;
}): Promise<RefreshPayload> {
  const data = await postsDbAuthFetch<{ refresh: RefreshPayload }>(
    '/auth/refresh/rotate',
    {
      method: 'POST',
      body: JSON.stringify({
        token: input.token,
        family_id: input.family_id,
      }),
    },
  );
  return data.refresh;
}

export async function revokeAuthRefresh(token: string): Promise<void> {
  await postsDbAuthFetch('/auth/refresh/revoke', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function logoutAllAuthSessions(userId: string): Promise<void> {
  await postsDbAuthFetch('/auth/logout-all', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}
