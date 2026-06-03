import { useCallback, useEffect, useState } from 'react';
import { applyFontFamilyToDocument } from '../lib/fonts';
import {
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
} from '../lib/preferences';

const DEFAULT_FONT_PX = 18;
const FONT_STEP_PX = 2;
const MIN_FONT_PX = 14;
const MAX_FONT_PX = 32;

/**
 * Shared theme / font size / font family state for SiteMenu (and article reader).
 */
export function useSiteReadingPreferences() {
  const [theme, setTheme] = useState(THEMES.light);
  const [fontFamilyId, setFontFamilyId] = useState('montserrat');
  const [baseFontSize, setBaseFontSize] = useState(DEFAULT_FONT_PX);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const storedFontFamily = getStoredFontFamily();
    const storedFontSize = getStoredFontSize(DEFAULT_FONT_PX);

    setTheme(storedTheme);
    setFontFamilyId(storedFontFamily);
    setBaseFontSize(storedFontSize);
    applyThemeToDocument(storedTheme);
    applyFontFamilyToDocument(storedFontFamily);
    applyFontSizeToDocument(storedFontSize);
    setReady(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () => {
      if (localStorage.getItem('eduardoos-theme')) return;
      const next = getSystemTheme();
      setTheme(next);
      applyThemeToDocument(next);
    };

    media.addEventListener('change', onSystemThemeChange);
    return () => media.removeEventListener('change', onSystemThemeChange);
  }, []);

  const onToggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === THEMES.dark ? THEMES.light : THEMES.dark;
      persistTheme(next);
      return next;
    });
  }, []);

  const onIncreaseFont = useCallback(() => {
    setBaseFontSize((size) => {
      const next = clampFontSize(Math.min(size + FONT_STEP_PX, MAX_FONT_PX));
      persistFontSize(next);
      return next;
    });
  }, []);

  const onDecreaseFont = useCallback(() => {
    setBaseFontSize((size) => {
      const next = clampFontSize(Math.max(size - FONT_STEP_PX, MIN_FONT_PX));
      persistFontSize(next);
      return next;
    });
  }, []);

  const onSelectFont = useCallback((id) => {
    setFontFamilyId(id);
    persistFontFamily(id);
  }, []);

  return {
    ready,
    theme,
    fontFamilyId,
    baseFontSize,
    onToggleTheme,
    onIncreaseFont,
    onDecreaseFont,
    onSelectFont,
  };
}
