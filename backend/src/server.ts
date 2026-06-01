import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { buildSeriesCatalog, getNextArticleId } from './seriesCatalog.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Load secrets directly if not using dotenv library yet
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';

app.use(express.json());
app.use(cookieParser());
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:4321',
  'https://eduardoos.com',
  'https://www.eduardoos.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));

// --- Mock Database ---
const MOCK_USER = { id: '1', email: 'eduardo@test.com', role: 'admin' };

// --- Endpoints ---

// 1. Health Check (To prove the server is running)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 2. Login (Generates both tokens)
app.post('/api/auth/login', (req: Request, res: Response) => {
  // In reality, validate req.body against Zod and check DB
  const accessToken = jwt.sign({ userId: MOCK_USER.id }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: MOCK_USER.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user: MOCK_USER });
});

app.get('/api/series/catalog', async (_req: Request, res: Response) => {
  try {
    const catalog = await buildSeriesCatalog();
    return res.json(catalog);
  } catch (error) {
    console.error('[series/catalog]', error);
    return res.status(500).json({ error: 'No se pudo leer /data/series/' });
  }
});

app.get('/api/series/next-article-id', async (req: Request, res: Response) => {
  const serie = String(req.query.serie ?? '').trim();
  const chapter = String(req.query.chapter ?? '').trim();

  if (!serie || !chapter) {
    return res.status(400).json({ error: 'serie y chapter son obligatorios' });
  }

  try {
    const next = await getNextArticleId(serie, chapter);
    return res.json(next);
  } catch (error) {
    console.error('[series/next-article-id]', error);
    return res.status(500).json({ error: 'No se pudo calcular el id del artículo' });
  }
});

const POST_EDITOR_PASSWORD = process.env.POST_EDITOR_PASSWORD || 'editor-dev';

app.post('/api/auth/post/editor/', (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };

  if (!password || password !== POST_EDITOR_PASSWORD) {
    return res.status(401).json({ valid: false, error: 'Contraseña incorrecta' });
  }

  return res.json({ valid: true });
});

app.post('/api/post/editor/', (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Cuerpo JSON inválido' });
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.title !== 'string' || !Array.isArray(record.sections)) {
    return res.status(400).json({
      error: 'El artículo debe incluir title y sections',
    });
  }

  const serie = String(record.serie ?? '').trim();
  const chapter = String(record.chapter ?? '').trim();
  const articleId = String(record.article_id ?? '').trim();
  const storagePath =
    serie && chapter && articleId
      ? `${serie}/${chapter}/${articleId}`
      : undefined;

  console.log('[post/editor] received payload:', JSON.stringify(payload, null, 2));
  if (storagePath) {
    console.log('[post/editor] storage path:', storagePath);
  }

  return res.json({
    ok: true,
    message: 'Artículo recibido',
    path: storagePath,
  });
});

// 3. Refresh (The core of token rotation)
app.post('/api/auth/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});