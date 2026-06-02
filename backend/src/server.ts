import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './router/index.js';
import { CORS_ORIGINS_SET, PORT } from './constants/index.js';

const app = express();

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});