import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, type AccessTokenClaims } from './jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AccessTokenClaims;
  }
}

function readBearerToken(req: Request): string {
  const header = String(req.headers.authorization ?? '');
  if (!header.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length).trim();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = readBearerToken(req);
    if (!token) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'unauthorized' });
  }
}

export function requireVerifiedEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.auth?.email_verified) {
    res.status(403).json({ ok: false, error: 'email_not_verified' });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRoles = req.auth?.roles ?? [];
    const allowed = roles.some((role) => userRoles.includes(role));
    if (!allowed) {
      res.status(403).json({ ok: false, error: 'forbidden' });
      return;
    }
    next();
  };
}

export const requireEditor = requireRole('editor', 'admin');
export const requireAdmin = requireRole('admin');
