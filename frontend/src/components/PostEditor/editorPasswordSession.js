const STORAGE_KEY = 'eduardoos-editor-password';

export function readStoredEditorPassword() {
  if (typeof sessionStorage === 'undefined') return '';
  return String(sessionStorage.getItem(STORAGE_KEY) ?? '').trim();
}

export function rememberEditorPassword(password) {
  const clean = String(password ?? '').trim();
  if (typeof sessionStorage !== 'undefined' && clean) {
    sessionStorage.setItem(STORAGE_KEY, clean);
  }
  return clean;
}

export function clearStoredEditorPassword() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
