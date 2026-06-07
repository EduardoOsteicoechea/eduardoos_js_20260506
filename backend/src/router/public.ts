import { Router } from 'express';
import {
  chatbotPublicAuth,
  proxyChatbot,
} from '../handlers/chatbotHandlers.js';
import { downloadArticlePdf } from '../handlers/documentHandlers.js';
import { saveCatalogMetadata } from '../handlers/catalogHandlers.js';
import {
  savePostEditorArticle,
  validatePostEditorPassword,
} from '../handlers/postHandlers.js';
import { generatePdf, getPdfCapabilities } from '../handlers/pdfHandlers.js';
import {
  listMedia,
  serveMediaObject,
  uploadMedia,
} from '../handlers/mediaHandlers.js';
import { getServiceLogs } from '../handlers/logsHandlers.js';
import {
  getSeriesArticle,
  getSeriesArticles,
  getDbSeriesCatalog,
  getSeriesCatalog,
  getSeriesDiscover,
  getSeriesHub,
  getSeriesNextArticleId,
} from '../handlers/seriesHandlers.js';

export const publicRouter = Router();

publicRouter.get('/series/catalog', getSeriesCatalog);
publicRouter.get('/db/series/catalog', getDbSeriesCatalog);
publicRouter.get('/series/discover', getSeriesDiscover);
publicRouter.get('/series/hub', getSeriesHub);
publicRouter.get('/series/next-article-id', getSeriesNextArticleId);
publicRouter.get('/series/articles', getSeriesArticles);
publicRouter.get('/series/article', getSeriesArticle);
publicRouter.post('/auth/post/editor/', validatePostEditorPassword);
publicRouter.post('/post/editor/', savePostEditorArticle);
publicRouter.post('/catalog/save', saveCatalogMetadata);
publicRouter.get('/logs', getServiceLogs);
publicRouter.get('/media/list', listMedia);
publicRouter.get('/media/object', serveMediaObject);
publicRouter.post('/media/upload', ...uploadMedia);
publicRouter.post('/documents/article-pdf', downloadArticlePdf);
publicRouter.post('/chatbot', chatbotPublicAuth, proxyChatbot);
publicRouter.get('/pdf/capabilities', getPdfCapabilities);
publicRouter.post('/pdf/generate', generatePdf);
