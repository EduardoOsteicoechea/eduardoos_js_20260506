import { Router } from 'express';
import multer from 'multer';
import {
  savePostEditorArticle,
  validatePostEditorPassword,
} from '../handlers/postHandlers.js';
import { generatePdf, getPdfCapabilities } from '../handlers/pdfHandlers.js';
import {
  getSeriesArticle,
  getSeriesArticles,
  getSeriesCatalog,
  getSeriesNextArticleId,
} from '../handlers/seriesHandlers.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 32,
  },
});

export const publicRouter = Router();

publicRouter.get('/series/catalog', getSeriesCatalog);
publicRouter.get('/series/next-article-id', getSeriesNextArticleId);
publicRouter.get('/series/articles', getSeriesArticles);
publicRouter.get('/series/article', getSeriesArticle);
publicRouter.post('/auth/post/editor/', validatePostEditorPassword);
publicRouter.post('/post/editor/', upload.any(), savePostEditorArticle);
publicRouter.get('/pdf/capabilities', getPdfCapabilities);
publicRouter.post('/pdf/generate', generatePdf);
