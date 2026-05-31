import {
  DEFAULT_FONT_FAMILY_ID,
  applyFontFamilyToDocument,
  getFontFamilyById,
} from './fonts';

export const STORAGE_KEYS = {
  theme: 'eduardoos-theme',
  fontSize: 'eduardoos-article-font-size',
  fontFamily: 'eduardoos-font-family',
};

export const THEMES = {
  light: 'light',
  dark: 'dark',
};

const MIN_FONT_PX = 14;
const MAX_FONT_PX = 32;

export function clampFontSize(px, fallback = 18) {
  const value = Number(px);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, Math.round(value)));
}

export function getStoredTheme() {
  if (typeof localStorage === 'undefined') return THEMES.light;
  return localStorage.getItem(STORAGE_KEYS.theme) === THEMES.dark
    ? THEMES.dark
    : THEMES.light;
}

export function getStoredFontSize(fallback = 18) {
  if (typeof localStorage === 'undefined') return fallback;
  return clampFontSize(localStorage.getItem(STORAGE_KEYS.fontSize), fallback);
}

export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === THEMES.dark);
}

export function persistTheme(theme) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  applyThemeToDocument(theme);
}

export function persistFontSize(px) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.fontSize, String(clampFontSize(px)));
}

export function getStoredFontFamily() {
  if (typeof localStorage === 'undefined') return DEFAULT_FONT_FAMILY_ID;
  const stored = localStorage.getItem(STORAGE_KEYS.fontFamily);
  return getFontFamilyById(stored)?.id ?? DEFAULT_FONT_FAMILY_ID;
}

export function persistFontFamily(fontFamilyId) {
  if (typeof localStorage === 'undefined') return;
  const font = getFontFamilyById(fontFamilyId);
  localStorage.setItem(STORAGE_KEYS.fontFamily, font.id);
  applyFontFamilyToDocument(font.id);
}
