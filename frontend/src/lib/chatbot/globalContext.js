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
 */

/**
 * @returns {GlobalChatContext}
 */
export function getGlobalChatContext() {
  return {
    schemaVersion: GLOBAL_CONTEXT_SCHEMA_VERSION,
    implemented: false,
    sessionId: null,
    permissions: [],
    userDisplayName: null,
    statusMessage:
      'Global session context is not available yet. Only page context is active.',
  };
}
