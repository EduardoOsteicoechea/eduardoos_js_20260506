import {
  cycleChatLanguage,
  getStoredChatLanguage,
  setStoredChatLanguage,
} from './chatbot/chatLanguage';
import { setChatbotLanguage } from './chatbot/chatbotStore';
import { applyPageTranslations } from './pageTranslations';
import { notifySiteLanguageChange } from './siteLanguage';

/** @typedef {import('./siteLanguage').SiteLanguageId} SiteLanguageId */

/**
 * @param {SiteLanguageId} lang
 */
export function applySitePageLanguage(lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-site-lang', lang);
  applyPageTranslations(lang);
}

/**
 * @param {SiteLanguageId} lang
 */
export function persistSitePageLanguage(lang) {
  setStoredChatLanguage(lang);
  setChatbotLanguage(lang);
  applySitePageLanguage(lang);
  notifySiteLanguageChange();
}

/** @returns {SiteLanguageId} */
export function getSitePageLanguage() {
  return getStoredChatLanguage();
}

export function toggleSitePageLanguage() {
  const next = cycleChatLanguage(getSitePageLanguage());
  persistSitePageLanguage(next);
  return next;
}
