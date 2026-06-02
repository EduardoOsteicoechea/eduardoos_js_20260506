import express from 'express';
import cors from 'cors';
import { generateArticlePdfHandler } from './handlers/pdfHandlers.js';

const app = express();
const PORT = Number(process.env.PORT || 8090);

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.get('/health', (_req, res) => {
  return res.json({
    ok: true,
    service: 'documenter',
  });
});

app.post('/documents/article-pdf', generateArticlePdfHandler);

app.listen(PORT, () => {
  console.log(`Documenter API running on port ${PORT}`);
});
