import { Router } from 'express';
import { publicRouter } from './public.js';
import { privateRouter } from './private.js';

export const apiRouter = Router();

apiRouter.use(publicRouter);
apiRouter.use(privateRouter);
