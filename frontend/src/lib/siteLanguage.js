import {
  CHAT_LANGUAGE_STORAGE_KEY,
  getStoredChatLanguage,
} from './chatbot/chatLanguage';

export const SITE_LANGUAGE_CHANGE_EVENT = 'eduardoos-language-change';

/** @typedef {'en' | 'es'} SiteLanguageId */

/** @type {Record<string, Record<SiteLanguageId, string>>} */
export const SITE_LABELS = {
  posts: { en: 'Posts', es: 'Publicaciones' },
  allPosts: { en: 'All posts', es: 'Todas las publicaciones' },
  noPostsHere: {
    en: 'No posts in this path.',
    es: 'No hay publicaciones en esta ruta.',
  },
  home: { en: 'Home', es: 'Inicio' },
  editor: { en: 'Editor', es: 'Editor' },
  settings: { en: 'Settings', es: 'Ajustes' },
  menu: { en: 'Menu', es: 'Menú' },
  closeMenu: { en: 'Close menu', es: 'Cerrar menú' },
  closePanel: { en: 'Close assistant', es: 'Cerrar asistente' },
  openMenu: { en: 'Open menu', es: 'Abrir menú' },
  seriesIndexTitle: { en: 'Posts', es: 'Publicaciones' },
  seriesIndexSubtitle: {
    en: 'Series and articles from the site catalog.',
    es: 'Series y artículos del catálogo del sitio.',
  },
  seriesSection: { en: 'Series', es: 'Series' },
};

/** @returns {SiteLanguageId} */
export function getSiteLanguage() {
  return getStoredChatLanguage();
}

/**
 * @param {keyof typeof SITE_LABELS} key
 * @param {SiteLanguageId} [lang]
 */
export function getSiteLabel(key, lang = getSiteLanguage()) {
  const entry = SITE_LABELS[key];
  return entry?.[lang] ?? entry?.en ?? key;
}

export function notifySiteLanguageChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SITE_LANGUAGE_CHANGE_EVENT));
}
