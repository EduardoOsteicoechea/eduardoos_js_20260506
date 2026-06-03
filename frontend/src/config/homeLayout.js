/** @param {string} pathname */
export function isHomePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/';
}

/** Home chat tray stays closed on first load below this width (px). */
export const HOME_MOBILE_MAX_WIDTH = 767;

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isHomeMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${HOME_MOBILE_MAX_WIDTH}px)`).matches;
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function shouldOpenChatbotTrayByDefault(pathname) {
  if (!isHomePath(pathname)) return true;
  return !isHomeMobileViewport();
}
