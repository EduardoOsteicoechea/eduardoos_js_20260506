export const CHAT_LANGUAGE_STORAGE_KEY = 'eduardoos-chatbot-language';

/** @typedef {'en' | 'es'} ChatLanguageId */

/** @type {{ id: ChatLanguageId, label: string, replyLanguageInstruction: string, inputPlaceholder: string, sendLabel: string }[]} */
export const CHAT_LANGUAGES = [
  {
    id: 'en',
    label: 'English',
    replyLanguageInstruction:
      'You MUST write every reply in English only, even if the user writes in Spanish or mixes languages.',
    inputPlaceholder: 'Write your message…',
    sendLabel: 'Send',
  },
  {
    id: 'es',
    label: 'Español',
    replyLanguageInstruction:
      'Debes escribir todas las respuestas solo en español, aunque el usuario escriba en inglés o mezcle idiomas.',
    inputPlaceholder: 'Escribe tu mensaje…',
    sendLabel: 'Enviar',
  },
];

/** @returns {ChatLanguageId} */
export function getStoredChatLanguage() {
  if (typeof localStorage === 'undefined') return 'en';
  const stored = localStorage.getItem(CHAT_LANGUAGE_STORAGE_KEY);
  return CHAT_LANGUAGES.some((lang) => lang.id === stored) ? /** @type {ChatLanguageId} */ (stored) : 'en';
}

/** @param {ChatLanguageId} id */
export function setStoredChatLanguage(id) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CHAT_LANGUAGE_STORAGE_KEY, id);
}

/** @param {ChatLanguageId} current */
export function cycleChatLanguage(current) {
  const index = CHAT_LANGUAGES.findIndex((lang) => lang.id === current);
  const next = CHAT_LANGUAGES[(index + 1) % CHAT_LANGUAGES.length];
  return next.id;
}

/** @param {ChatLanguageId} id */
export function getChatLanguageConfig(id) {
  return CHAT_LANGUAGES.find((lang) => lang.id === id) ?? CHAT_LANGUAGES[0];
}
