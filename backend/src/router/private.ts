import { Router } from 'express';
import {
  requireAuth,
  requireAdmin,
  requireEditor,
  requireVerifiedEmail,
} from '../auth/middleware.js';
import { saveCatalogMetadata } from '../handlers/catalogHandlers.js';
import { getServiceLogs } from '../handlers/logsHandlers.js';
import { uploadMedia } from '../handlers/mediaHandlers.js';
import { savePostEditorArticle } from '../handlers/postHandlers.js';
import {
  getProfile,
  logoutUser,
  updateProfile,
} from '../handlers/authHandlers.js';

export const privateRouter = Router();

privateRouter.get('/auth/profile', requireAuth, getProfile);
privateRouter.patch('/auth/profile', requireAuth, updateProfile);
privateRouter.post('/auth/logout', logoutUser);

privateRouter.post(
  '/post/editor/',
  requireAuth,
  requireVerifiedEmail,
  requireEditor,
  savePostEditorArticle,
);
privateRouter.post(
  '/catalog/save',
  requireAuth,
  requireVerifiedEmail,
  requireEditor,
  saveCatalogMetadata,
);
privateRouter.post(
  '/media/upload',
  requireAuth,
  requireVerifiedEmail,
  requireEditor,
  ...uploadMedia,
);
privateRouter.get('/logs', requireAuth, requireAdmin, getServiceLogs);
