import { getChatLanguageConfig, getStoredChatLanguage } from './chatLanguage';
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
 * @property {import('./chatLanguage').ChatLanguageId} preferredLanguage
 * @property {string} replyLanguage
 * @property {string} replyLanguageInstruction
 */

/**
 * @param {string} [pathname]
 * @param {import('./chatLanguage').ChatLanguageId} [preferredLanguage]
 * @returns {GlobalChatContext}
 */
export function getGlobalChatContext(
  pathname = '/',
  preferredLanguage = getStoredChatLanguage(),
) {
  const lang = getChatLanguageConfig(preferredLanguage);

  return {
    schemaVersion: GLOBAL_CONTEXT_SCHEMA_VERSION,
    implemented: false,
    sessionId: null,
    permissions: [],
    userDisplayName: null,
    statusMessage:
      'Page context, site navigation, and reply language preference are active.',
    siteNavigation: getSiteNavigationContext(pathname),
    preferredLanguage: lang.id,
    replyLanguage: lang.label,
    replyLanguageInstruction: lang.replyLanguageInstruction,
  };
}
