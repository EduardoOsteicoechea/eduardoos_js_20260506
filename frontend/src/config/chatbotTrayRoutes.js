import {
  matchPageBackgroundPattern,
  normalizePagePath,
} from './pageBackgroundRoutes';

/** Routes where the AI chatbot tray is open by default (first match wins). */
export const CHATBOT_OPEN_BY_DEFAULT_ROUTES = ['/', '/profile', '/profile/*'];

export const CHATBOT_TRAY_WIDTH = 'min(28rem, 32vw)';

/**
 * @param {string} pathname
 */
export function isChatbotOpenByDefault(pathname) {
  const path = normalizePagePath(pathname);
  return CHATBOT_OPEN_BY_DEFAULT_ROUTES.some((pattern) =>
    matchPageBackgroundPattern(path, pattern),
  );
}
