/**
 * Routes the chatbot may navigate to (allowlisted server-side).
 * Dynamic article URLs must match pathPatterns.
 */

/** @typedef {{ path: string, label: string, description?: string }} ChatbotNavRoute */

/** @type {ChatbotNavRoute[]} */
export const CHATBOT_NAV_ROUTES = [
  { path: '/', label: 'Inicio', description: 'Home — BIM services and skills' },
  {
    path: '/series',
    label: 'Estudios bíblicos',
    description: 'Series index and biblical studies hub',
  },
  {
    path: '/post/editor',
    label: 'Editor de posts',
    description: 'Create and edit articles (authenticated)',
  },
  {
    path: '/post/creator',
    label: 'Creador de posts',
    description: 'Article creation flow',
  },
];

/** @type {string[]} */
export const CHATBOT_NAV_PATH_PATTERNS = ['/series/*', '/articles/*'];

/**
 * @returns {{
 *   schemaVersion: number,
 *   routes: ChatbotNavRoute[],
 *   pathPatterns: string[],
 *   currentPathname: string,
 * }}
 */
export function getSiteNavigationContext(pathname = '/') {
  return {
    schemaVersion: 1,
    routes: CHATBOT_NAV_ROUTES,
    pathPatterns: CHATBOT_NAV_PATH_PATTERNS,
    currentPathname: pathname,
  };
}
