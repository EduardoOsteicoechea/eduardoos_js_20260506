import { Router } from 'express';
import {
  chatbotPublicAuth,
  proxyChatbot,
} from '../handlers/chatbotHandlers.js';
import { downloadArticlePdf } from '../handlers/documentHandlers.js';
import {
  forgotPassword,
  loginUser,
  refreshSession,
  registerUser,
  resendVerification,
  resetPassword,
  validateEmail,
} from '../handlers/authHandlers.js';
import { generatePdf, getPdfCapabilities } from '../handlers/pdfHandlers.js';
import {
  listMedia,
  serveMediaObject,
} from '../handlers/mediaHandlers.js';
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
publicRouter.post('/auth/register', registerUser);
publicRouter.post('/auth/login', loginUser);
publicRouter.post('/auth/refresh', refreshSession);
publicRouter.post('/auth/validate-email', validateEmail);
publicRouter.post('/auth/resend-verification', resendVerification);
publicRouter.post('/auth/forgot-password', forgotPassword);
publicRouter.post('/auth/reset-password', resetPassword);
publicRouter.get('/media/list', listMedia);
publicRouter.get('/media/object', serveMediaObject);
publicRouter.post('/documents/article-pdf', downloadArticlePdf);
publicRouter.post('/chatbot', chatbotPublicAuth, proxyChatbot);
publicRouter.get('/pdf/capabilities', getPdfCapabilities);
publicRouter.post('/pdf/generate', generatePdf);
