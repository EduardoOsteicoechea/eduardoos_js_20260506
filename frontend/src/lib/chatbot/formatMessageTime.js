/**
 * @param {string | Date} value
 * @param {'en' | 'es'} [lang]
 */
export function formatMessageTime(value, lang = 'en') {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString(lang === 'es' ? 'es' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
