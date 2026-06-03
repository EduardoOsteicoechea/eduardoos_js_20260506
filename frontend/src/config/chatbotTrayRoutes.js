import { shouldOpenChatbotTrayByDefault } from './homeLayout';
import {
  matchPageBackgroundPattern,
  normalizePagePath,
} from './pageBackgroundRoutes';

/** Routes where the AI chatbot tray is open by default (first match wins). */
export const CHATBOT_OPEN_BY_DEFAULT_ROUTES = ['/', '/profile', '/profile/*'];

/** @deprecated Use CSS var --chatbot-tray-width (see chatbotTrayWidthStore). */
export const CHATBOT_TRAY_WIDTH = 'var(--chatbot-tray-width, min(22rem, 44vw))';

export const CHATBOT_TRAY_DEFAULT_WIDTH_PX = 352;
export const CHATBOT_TRAY_MIN_WIDTH_PX = 280;
export const CHATBOT_TRAY_MAX_VW = 90;

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
