import type { CookieOptions, Request, Response } from 'express';
import {
  AUTH_COOKIE_DOMAIN,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_SECURE,
  JWT_REFRESH_TTL_MS,
} from '../constants/index.js';

export interface RefreshCookiePayload {
  token: string;
  family_id: string;
}

export function refreshCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: AUTH_COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: JWT_REFRESH_TTL_MS,
  };

  if (AUTH_COOKIE_DOMAIN) {
    options.domain = AUTH_COOKIE_DOMAIN;
  }

  return options;
}

export function setRefreshCookie(
  res: Response,
  payload: RefreshCookiePayload,
): void {
  const value = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  res.cookie(AUTH_COOKIE_NAME, value, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, refreshCookieOptions());
}

export function readRefreshCookie(req: Request): RefreshCookiePayload | null {
  const raw = req.cookies?.[AUTH_COOKIE_NAME];
  if (!raw || typeof raw !== 'string') return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf8'),
    ) as RefreshCookiePayload;
    if (!decoded?.token || !decoded?.family_id) return null;
    return decoded;
  } catch {
    return null;
  }
}
