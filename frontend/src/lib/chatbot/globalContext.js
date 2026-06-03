import { getSiteNavigationContext } from './siteRoutes';

export const GLOBAL_CONTEXT_SCHEMA_VERSION = 1;

/**
 * Session-scoped global context (permissions, user profile, etc.).
 * Not implemented yet — placeholder for future session API.
 *
 * @typedef {Object} GlobalChatContext
 * @property {number} schemaVersion
 * @property {boolean} implemented
 * @property {string | null} sessionId
 * @property {string[]} permissions
 * @property {string | null} userDisplayName
 * @property {string} statusMessage
 * @property {ReturnType<typeof getSiteNavigationContext>} siteNavigation
 */

/**
 * @param {string} [pathname]
 * @returns {GlobalChatContext}
 */
export function getGlobalChatContext(pathname = '/') {
  return {
    schemaVersion: GLOBAL_CONTEXT_SCHEMA_VERSION,
    implemented: false,
    sessionId: null,
    permissions: [],
    userDisplayName: null,
    statusMessage:
      'Global session context is not available yet. Page context and site navigation are active.',
    siteNavigation: getSiteNavigationContext(pathname),
  };
}
