import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_TTL_SECONDS,
} from '../constants/index.js';
import type { AuthUser } from '../postsDbAuthClient.js';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  roles: string[];
  email_verified: boolean;
}

export function signAccessToken(user: AuthUser): string {
  const payload: AccessTokenClaims = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    email_verified: user.email_verified,
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  if (!decoded || typeof decoded !== 'object') {
    throw new Error('invalid token');
  }

  const record = decoded as Record<string, unknown>;
  const sub = String(record.sub ?? '');
  if (!sub) {
    throw new Error('invalid token');
  }

  return {
    sub,
    email: String(record.email ?? ''),
    roles: Array.isArray(record.roles)
      ? record.roles.map((role) => String(role))
      : [],
    email_verified: Boolean(record.email_verified),
  };
}
