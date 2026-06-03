/**
 * @param {string} path
 */
export function navigateTo(path) {
  if (typeof window === 'undefined' || !path) return;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  window.location.assign(normalized);
}

/**
 * User explicitly asked to be taken to a page.
 * @param {string} text
 */
export function isNavigationIntent(text) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    /\b(lleva(?:me)?|llévame|ir a|ve a|vamos a|abre|open|go to|take me|navigate|muéstrame|muestrame)\b/i.test(
      t,
    ) || /\b(página|pagina|sección|seccion|section|page)\b/i.test(t)
  );
}
