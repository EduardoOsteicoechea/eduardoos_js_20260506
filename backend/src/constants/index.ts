import { join } from 'node:path';
import { getEnvOrDefault, getEnvNumber } from './env.js';

export const PORT = getEnvNumber('PORT', 8080);
export const POST_EDITOR_PASSWORD = getEnvOrDefault(
  'POST_EDITOR_PASSWORD',
  'editor-dev',
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

export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4321',
  'https://eduardoos.com',
  'https://www.eduardoos.com',
] as const;

export const CORS_ORIGINS_SET = new Set<string>(CORS_ORIGINS);
