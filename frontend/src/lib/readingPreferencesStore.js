import { applyFontFamilyToDocument } from './fonts';
import {
  STORAGE_KEYS,
  THEMES,
  applyFontSizeToDocument,
  applyThemeToDocument,
  clampFontSize,
  getStoredFontFamily,
  getStoredFontSize,
  getStoredTheme,
  getSystemTheme,
  persistFontFamily,
  persistFontSize,
  persistTheme,
} from './preferences';

/** @type {Set<() => void>} */
const listeners = new Set();

let revision = 0;
let theme = THEMES.light;
let fontFamilyId = 'montserrat';
let baseFontSize = 18;
let hydrated = false;

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function getReadingPreferencesRevision() {
  return revision;
}

export function subscribeReadingPreferences(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Cached for useSyncExternalStore — must be a stable reference. */
const READING_PREFERENCES_SERVER_SNAPSHOT = Object.freeze({
  theme: THEMES.light,
  fontFamilyId: 'montserrat',
  baseFontSize: 18,
  ready: false,
});

let cachedClientSnapshot = READING_PREFERENCES_SERVER_SNAPSHOT;

export function getReadingPreferencesSnapshot() {
  if (
    cachedClientSnapshot.theme === theme &&
    cachedClientSnapshot.fontFamilyId === fontFamilyId &&
    cachedClientSnapshot.baseFontSize === baseFontSize &&
    cachedClientSnapshot.ready === hydrated
  ) {
    return cachedClientSnapshot;
  }

  cachedClientSnapshot = {
    theme,
    fontFamilyId,
    baseFontSize,
    ready: hydrated,
  };
  return cachedClientSnapshot;
}

/** SSR / first client paint — must match before localStorage hydration. */
export function getReadingPreferencesServerSnapshot() {
  return READING_PREFERENCES_SERVER_SNAPSHOT;
}

function hydrateFromStorage() {
  theme = getStoredTheme();
  fontFamilyId = getStoredFontFamily();
  baseFontSize = getStoredFontSize(18);
  applyThemeToDocument(theme);
  applyFontFamilyToDocument(fontFamilyId);
  applyFontSizeToDocument(baseFontSize);
  hydrated = true;
}

if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    if (stored === THEMES.light || stored === THEMES.dark) return;
    theme = getSystemTheme();
    applyThemeToDocument(theme);
    emit();
  });
}

/** Call from hooks on SSR hydration if store was not initialized on client yet. */
export function ensureReadingPreferencesHydrated() {
  if (hydrated) return;
  hydrateFromStorage();
  emit();
}

export function toggleReadingTheme() {
  const next = theme === THEMES.dark ? THEMES.light : THEMES.dark;
  theme = next;
  persistTheme(next);
  emit();
}

export function increaseReadingFontSize() {
  baseFontSize = clampFontSize(Math.min(baseFontSize + 2, 32));
  persistFontSize(baseFontSize);
  emit();
}

export function decreaseReadingFontSize() {
  baseFontSize = clampFontSize(Math.max(baseFontSize - 2, 14));
  persistFontSize(baseFontSize);
  emit();
}

/** @param {string} id */
export function setReadingFontFamily(id) {
  fontFamilyId = id;
  persistFontFamily(id);
  emit();
}
