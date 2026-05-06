import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 8080;

// Load secrets directly if not using dotenv library yet
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', 
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