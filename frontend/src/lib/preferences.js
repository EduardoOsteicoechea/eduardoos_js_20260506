import {
  DEFAULT_FONT_FAMILY_ID,
  applyFontFamilyToDocument,
  getFontFamilyById,
} from './fonts';
import { DEFAULT_VIEW_MODE, VIEW_MODES } from './viewModes';

export const STORAGE_KEYS = {
  theme: 'eduardoos-theme',
  fontSize: 'eduardoos-article-font-size',
  fontFamily: 'eduardoos-font-family',
  viewMode: 'eduardoos-view-mode',
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

export function getSystemTheme() {
  if (typeof window === 'undefined') return THEMES.light;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.dark
    : THEMES.light;
}

export function getStoredTheme() {
  if (typeof localStorage === 'undefined') return THEMES.light;
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === THEMES.dark) return THEMES.dark;
  if (stored === THEMES.light) return THEMES.light;
  return getSystemTheme();
}

export function getStoredFontSize(fallback = 18) {
  if (typeof localStorage === 'undefined') return fallback;
  return clampFontSize(localStorage.getItem(STORAGE_KEYS.fontSize), fallback);
}

export function hasExplicitThemePreference() {
  if (typeof localStorage === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  return stored === THEMES.light || stored === THEMES.dark;
}

/** @param {string} theme */
export function resolveThemeFlags(theme) {
  const isDark = theme === THEMES.dark;
  return {
    isDark,
    dataTheme: isDark ? THEMES.dark : THEMES.light,
    colorScheme: isDark ? 'dark' : 'light',
  };
}

export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  const { isDark, dataTheme, colorScheme } = resolveThemeFlags(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.dataset.theme = dataTheme;
  root.style.colorScheme = colorScheme;
}

export function persistTheme(theme) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  applyThemeToDocument(theme);
}

export function applyFontSizeToDocument(px, fallback = 18) {
  if (typeof document === 'undefined') return;
  const size = clampFontSize(px, fallback);
  document.documentElement.style.fontSize = `${size}px`;
}

export function persistFontSize(px) {
  if (typeof localStorage === 'undefined') return;
  const size = clampFontSize(px);
  localStorage.setItem(STORAGE_KEYS.fontSize, String(size));
  applyFontSizeToDocument(size);
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

export function getStoredViewMode() {
  if (typeof localStorage === 'undefined') return DEFAULT_VIEW_MODE;
  const stored = localStorage.getItem(STORAGE_KEYS.viewMode);
  return Object.values(VIEW_MODES).includes(stored)
    ? stored
    : DEFAULT_VIEW_MODE;
}

export function persistViewMode(viewMode) {
  if (typeof localStorage === 'undefined') return;
  if (!Object.values(VIEW_MODES).includes(viewMode)) return;
  localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
}
