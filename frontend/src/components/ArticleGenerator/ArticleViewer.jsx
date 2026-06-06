import { useCallback, useEffect, useState } from 'react';
import ArticleGenerator from './ArticleGenerator';
import { useArticleActivityBarActions } from './useArticleActivityBarActions';
import {
  getStoredViewMode,
  persistViewMode,
} from '../../lib/preferences';
import { VIEW_MODES } from '../../lib/viewModes';
import { useSiteReadingPreferences } from '../../hooks/useSiteReadingPreferences';
import { useSermonPlayer } from './useSermonPlayer';
import {
  buildPdfPayloadFromArticle,
  downloadArticlePdf,
} from '../../lib/articlePdfDownload';

export default function ArticleViewer({
  initialArticle,
  slug,
  articleApiPath,
  sermonPath: initialSermonPath,
}) {
  const [article, setArticle] = useState(initialArticle);
  const [viewMode, setViewMode] = useState(VIEW_MODES.regular);
  const [viewModeReady, setViewModeReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [isReloading, setIsReloading] = useState(false);
  const [reloadError, setReloadError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sermonPath, setSermonPath] = useState(initialSermonPath);

  const prefs = useSiteReadingPreferences();
  const sermon = useSermonPlayer(sermonPath);

  useEffect(() => {
    setSermonPath(initialSermonPath || undefined);
  }, [initialSermonPath]);

  useEffect(() => {
    setViewMode(getStoredViewMode());
    setViewModeReady(true);
  }, []);

  useEffect(() => {
    if (!viewModeReady) return;
    persistViewMode(viewMode);
  }, [viewMode, viewModeReady]);

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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const reloadArticle = useCallback(async () => {
    if (!articleApiPath) return;

    setIsReloading(true);
    setReloadError(null);

    try {
      const response = await fetch(`${articleApiPath}&t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const nextArticle = data?.article;

      if (!nextArticle?.title || !Array.isArray(nextArticle.sections)) {
        throw new Error('Respuesta inválida: falta article.title o sections');
      }

      setArticle(nextArticle);
      setSermonPath(
        typeof data.sermon_url === 'string' && data.sermon_url.trim()
          ? data.sermon_url.trim()
          : undefined,
      );
      setExpandedSections(new Set());
      sermon.stop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setReloadError(
        error instanceof Error ? error.message : 'No se pudo recargar el artículo',
      );
    } finally {
      setIsReloading(false);
    }
  }, [articleApiPath, sermon]);

  const handleDownloadPdf = useCallback(async () => {
    if (!slug) return;

    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      const payload = buildPdfPayloadFromArticle(slug, article);
      await downloadArticlePdf(payload);
    } catch (error) {
      setPdfError(
        error instanceof Error ? error.message : 'No se pudo generar el PDF',
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [article, slug]);

  const { viewModePanel } = useArticleActivityBarActions({
    viewMode,
    onSelectViewMode: setViewMode,
    onScrollToTop: scrollToTop,
    onScrollToBottom: scrollToBottom,
    onReload: reloadArticle,
    isReloading,
    onDownloadPdf: handleDownloadPdf,
    isGeneratingPdf,
    hasSermon: sermon.hasSermon,
    isSermonPlaying: sermon.isPlaying,
    isSermonLoading: sermon.isLoading,
    onToggleSermon: sermon.togglePlayPause,
  });

  return (
    <>
      {reloadError ? (
        <p className="article-viewer__notice theme-border">
          Error al recargar: {reloadError}
        </p>
      ) : null}

      {pdfError ? (
        <p className="article-viewer__notice article-viewer__notice--error theme-border">
          Error al generar PDF: {pdfError}
        </p>
      ) : null}

      <ArticleGenerator
        article={article}
        slug={slug}
        baseFontSize={prefs.baseFontSize}
        viewMode={viewMode}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        sermonPath={sermon.hasSermon ? sermonPath : undefined}
        sermonAudioRef={sermon.audioRef}
      />

      {prefs.ready ? viewModePanel : null}
    </>
  );
}
