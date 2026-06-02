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

export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4321',
  'https://eduardoos.com',
  'https://www.eduardoos.com',
] as const;

export const CORS_ORIGINS_SET = new Set<string>(CORS_ORIGINS);
