import { shouldOpenChatbotTrayByDefault } from './homeLayout';
import {
  matchPageBackgroundPattern,
  normalizePagePath,
} from './pageBackgroundRoutes';

/** Routes where the AI chatbot tray is open by default (first match wins). */
export const CHATBOT_OPEN_BY_DEFAULT_ROUTES = ['/', '/profile', '/profile/*'];

export const CHATBOT_TRAY_WIDTH = 'min(22rem, 44vw)';

/**
 * @param {string} pathname
 */
export function isChatbotOpenByDefault(pathname) {
  const path = normalizePagePath(pathname);
  const matchesDefault = CHATBOT_OPEN_BY_DEFAULT_ROUTES.some((pattern) =>
    matchPageBackgroundPattern(path, pattern),
  );
  if (!matchesDefault) return false;
  return shouldOpenChatbotTrayByDefault(path);
}
