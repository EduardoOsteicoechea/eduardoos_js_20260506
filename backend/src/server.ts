import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './router/index.js';
import { CORS_ORIGINS_SET, PORT } from './constants/index.js';
import { installLogShip } from './logship.js';

installLogShip('backend');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS_SET.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use('/api', apiRouter);

const server = app.listen(PORT, '0.0.0.0');

server.on('listening', () => {
  const address = server.address();
  const boundPort =
    address && typeof address === 'object' ? address.port : PORT;
  console.log(`Backend API running on http://0.0.0.0:${boundPort}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('[backend] Failed to start:', error);
  process.exit(1);
});