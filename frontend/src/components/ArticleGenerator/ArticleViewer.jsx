import { useCallback, useEffect, useState } from 'react';
import ArticleGenerator from './ArticleGenerator';
import ArticleActivityBar from './ArticleActivityBar';
import {
  THEMES,
  applyThemeToDocument,
  getStoredFontFamily,
  getStoredFontSize,
  getStoredTheme,
  persistFontFamily,
  persistFontSize,
  persistTheme,
} from '../../lib/preferences';

const MIN_FONT_PX = 14;
const MAX_FONT_PX = 32;
const FONT_STEP_PX = 2;
const DEFAULT_FONT_PX = 18;

export default function ArticleViewer({ initialArticle, slug, jsonPath }) {
  const [article, setArticle] = useState(initialArticle);
  const [baseFontSize, setBaseFontSize] = useState(DEFAULT_FONT_PX);
  const [theme, setTheme] = useState(THEMES.light);
  const [fontFamilyId, setFontFamilyId] = useState('montserrat');
  const [prefsReady, setPrefsReady] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadError, setReloadError] = useState(null);

  useEffect(() => {
    setBaseFontSize(getStoredFontSize(DEFAULT_FONT_PX));
    const storedTheme = getStoredTheme();
    const storedFontFamily = getStoredFontFamily();
    setTheme(storedTheme);
    setFontFamilyId(storedFontFamily);
    applyThemeToDocument(storedTheme);
    persistFontFamily(storedFontFamily);
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    persistFontSize(baseFontSize);
  }, [baseFontSize, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    persistTheme(theme);
  }, [theme, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    persistFontFamily(fontFamilyId);
  }, [fontFamilyId, prefsReady]);

  const increaseFont = useCallback(() => {
    setBaseFontSize((size) => Math.min(size + FONT_STEP_PX, MAX_FONT_PX));
  }, []);

  const decreaseFont = useCallback(() => {
    setBaseFontSize((size) => Math.max(size - FONT_STEP_PX, MIN_FONT_PX));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === THEMES.dark ? THEMES.light : THEMES.dark,
    );
  }, []);

  const reloadJson = useCallback(async () => {
    if (!jsonPath) return;

    setIsReloading(true);
    setReloadError(null);

    try {
      const response = await fetch(`${jsonPath}?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data?.title || !Array.isArray(data.sections)) {
        throw new Error('JSON inválido: falta title o sections');
      }

      setArticle(data);
    } catch (error) {
      setReloadError(
        error instanceof Error ? error.message : 'No se pudo recargar el JSON',
      );
    } finally {
      setIsReloading(false);
    }
  }, [jsonPath]);

  return (
    <>
      {reloadError ? (
        <p className="theme-border mb-4 rounded-lg border px-4 py-2 text-sm">
          Error al recargar: {reloadError}
        </p>
      ) : null}

      <ArticleGenerator
        article={article}
        slug={slug}
        baseFontSize={baseFontSize}
      />

      <ArticleActivityBar
        theme={theme}
        fontFamilyId={fontFamilyId}
        onSelectFont={setFontFamilyId}
        onToggleTheme={toggleTheme}
        onIncreaseFont={increaseFont}
        onDecreaseFont={decreaseFont}
        onReload={reloadJson}
        isReloading={isReloading}
      />
    </>
  );
}
