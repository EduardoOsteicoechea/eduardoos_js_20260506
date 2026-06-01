import { useCallback, useEffect, useState } from 'react';
import ArticleGenerator from './ArticleGenerator';
import ArticleActivityBar from './ArticleActivityBar';
import {
  THEMES,
  applyThemeToDocument,
  getStoredFontFamily,
  getStoredFontSize,
  getStoredTheme,
  getStoredViewMode,
  persistFontFamily,
  persistFontSize,
  persistTheme,
  persistViewMode,
} from '../../lib/preferences';
import { VIEW_MODES } from '../../lib/viewModes';
import { useSermonPlayer } from './useSermonPlayer';

const MIN_FONT_PX = 14;
const MAX_FONT_PX = 32;
const FONT_STEP_PX = 2;
const DEFAULT_FONT_PX = 18;

export default function ArticleViewer({
  initialArticle,
  slug,
  jsonPath,
  sermonPath: initialSermonPath,
}) {
  const [article, setArticle] = useState(initialArticle);
  const [baseFontSize, setBaseFontSize] = useState(DEFAULT_FONT_PX);
  const [theme, setTheme] = useState(THEMES.light);
  const [fontFamilyId, setFontFamilyId] = useState('montserrat');
  const [viewMode, setViewMode] = useState(VIEW_MODES.regular);
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [prefsReady, setPrefsReady] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadError, setReloadError] = useState(null);
  const [sermonPath, setSermonPath] = useState(initialSermonPath);

  const sermon = useSermonPlayer(sermonPath);

  useEffect(() => {
    if (initialSermonPath) {
      setSermonPath(initialSermonPath);
      return;
    }

    if (!slug) {
      setSermonPath(undefined);
      return;
    }

    const candidate = `/data/series/${slug.replace(/^\/+|\/+$/g, '')}/sermon.mp3`;

    fetch(candidate, { method: 'HEAD' })
      .then((response) => {
        setSermonPath(response.ok ? candidate : undefined);
      })
      .catch(() => setSermonPath(undefined));
  }, [initialSermonPath, slug]);

  useEffect(() => {
    setBaseFontSize(getStoredFontSize(DEFAULT_FONT_PX));
    const storedTheme = getStoredTheme();
    const storedFontFamily = getStoredFontFamily();
    const storedViewMode = getStoredViewMode();
    setTheme(storedTheme);
    setFontFamilyId(storedFontFamily);
    setViewMode(storedViewMode);
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

  useEffect(() => {
    if (!prefsReady) return;
    persistViewMode(viewMode);
  }, [viewMode, prefsReady]);

  const toggleSection = useCallback((sectionIndex) => {
    setExpandedSections((previous) => {
      const next = new Set(previous);
      if (next.has(sectionIndex)) {
        next.delete(sectionIndex);
      } else {
        next.add(sectionIndex);
      }
      return next;
    });
  }, []);

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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
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
      setExpandedSections(new Set());
      sermon.stop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setReloadError(
        error instanceof Error ? error.message : 'No se pudo recargar el JSON',
      );
    } finally {
      setIsReloading(false);
    }
  }, [jsonPath, sermon]);

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
        viewMode={viewMode}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        sermonPath={sermon.hasSermon ? sermonPath : undefined}
        sermonAudioRef={sermon.audioRef}
      />

      <ArticleActivityBar
        theme={theme}
        fontFamilyId={fontFamilyId}
        baseFontSize={baseFontSize}
        viewMode={viewMode}
        onSelectFont={setFontFamilyId}
        onSelectViewMode={setViewMode}
        onToggleTheme={toggleTheme}
        onIncreaseFont={increaseFont}
        onDecreaseFont={decreaseFont}
        onScrollToTop={scrollToTop}
        onScrollToBottom={scrollToBottom}
        onReload={reloadJson}
        isReloading={isReloading}
        hasSermon={sermon.hasSermon}
        isSermonPlaying={sermon.isPlaying}
        isSermonLoading={sermon.isLoading}
        onToggleSermon={sermon.togglePlayPause}
      />
    </>
  );
}
