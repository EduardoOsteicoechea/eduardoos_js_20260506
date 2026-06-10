import { join } from 'node:path';
import { getEnvOrDefault, getEnvNumber } from './env.js';

export const PORT = getEnvNumber('PORT', 8080);
export const POST_EDITOR_PASSWORD = getEnvOrDefault(
  'POST_EDITOR_PASSWORD',
  'editor-dev',
);

export const JWT_ACCESS_SECRET = getEnvOrDefault(
  'JWT_ACCESS_SECRET',
  'dev-jwt-access-secret-change-me',
);
export const JWT_ACCESS_TTL_SECONDS = getEnvNumber('JWT_ACCESS_TTL_SECONDS', 900);
export const JWT_REFRESH_TTL_MS = getEnvNumber(
  'JWT_REFRESH_TTL_MS',
  7 * 24 * 60 * 60 * 1000,
);
export const AUTH_COOKIE_NAME = getEnvOrDefault(
  'AUTH_COOKIE_NAME',
  'eduardoos_refresh',
);
export const AUTH_COOKIE_DOMAIN = getEnvOrDefault('AUTH_COOKIE_DOMAIN', '');
export const AUTH_COOKIE_SECURE =
  getEnvOrDefault('AUTH_COOKIE_SECURE', 'false').toLowerCase() === 'true';
export const APP_PUBLIC_URL = getEnvOrDefault(
  'APP_PUBLIC_URL',
  'http://localhost:4321',
);
export const GOOGLE_EMAIL_APP_EMAIL = getEnvOrDefault(
  'GOOGLE_EMAIL_APP_EMAIL',
  '',
);
export const GOOGLE_EMAIL_APP_PASSWORD = getEnvOrDefault(
  'GOOGLE_EMAIL_APP_PASSWORD',
  '',
);
export const SERIES_DATA_ROOT = getEnvOrDefault(
  'SERIES_DATA_ROOT',
  join(process.cwd(), 'public/data/series'),
);
export const DOCUMENTER_URL = getEnvOrDefault(
  'DOCUMENTER_URL',
  'http://localhost:8090',
);
export const CHATBOT_URL = getEnvOrDefault(
  'CHATBOT_URL',
  'http://127.0.0.1:8110',
);
export const CHATBOT_INTERNAL_TOKEN = getEnvOrDefault(
  'CHATBOT_INTERNAL_TOKEN',
  'dev-internal-chatbot-token',
);
export const CHATBOT_PUBLIC_AUTH_ENABLED =
  getEnvOrDefault('CHATBOT_PUBLIC_AUTH_ENABLED', 'false').toLowerCase() ===
  'true';
export const POSTS_DB_URL = getEnvOrDefault(
  'POSTS_DB_URL',
  'http://127.0.0.1:8120',
);
export const POSTS_DB_INTERNAL_TOKEN = getEnvOrDefault(
  'POSTS_DB_INTERNAL_TOKEN',
  'dev-internal-posts-db-token',
);
export const GITHUB_DEPLOY_TOKEN = getEnvOrDefault('GITHUB_DEPLOY_TOKEN', '');
export const GITHUB_REPO = getEnvOrDefault(
  'GITHUB_REPO',
  'EduardoOsteicoechea/eduardoos_js_20260506',
);
export const S3_URL = getEnvOrDefault('S3_URL', 'http://127.0.0.1:8130');
export const S3_INTERNAL_TOKEN = getEnvOrDefault(
  'S3_INTERNAL_TOKEN',
  'dev-internal-s3-token',
);

export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4321',
  'https://eduardoos.com',
  'https://www.eduardoos.com',
] as const;

export const CORS_ORIGINS_SET = new Set<string>(CORS_ORIGINS);
