import { useEffect, useMemo, useState } from 'react';
import {
  clearActivityBarLeftActions,
  setActivityBarLeftActions,
} from '../../lib/activityBarActionsStore';

import VisualizationModePanel from './VisualizationModePanel';

/**
 * Registers article-specific activity bar actions in the global store and renders the view-mode panel.
 */
export function useArticleActivityBarActions({
  viewMode,
  onSelectViewMode,
  onScrollToTop,
  onScrollToBottom,
  onReload,
  isReloading,
  onDownloadPdf,
  isGeneratingPdf,
  hasSermon,
  isSermonPlaying,
  isSermonLoading,
  onToggleSermon,
}) {
  const [viewModePickerOpen, setViewModePickerOpen] = useState(false);

  const handleSelectViewMode = (mode) => {
    onSelectViewMode(mode);
    setViewModePickerOpen(false);
  };

  const actions = useMemo(
    () => {
      const items = [
        {
          id: 'view-mode',
          label: 'M',
          title: 'Modo de visualización',
          active: viewModePickerOpen,
          onClick: () => setViewModePickerOpen((open) => !open),
        },
      ];

      if (hasSermon) {
        items.push({
          id: 'sermon',
          label: isSermonLoading && !isSermonPlaying ? '…' : isSermonPlaying ? '❚❚' : '▶',
          title: isSermonPlaying ? 'Pausar sermón' : 'Reproducir sermón',
          active: isSermonPlaying,
          disabled: isSermonLoading && !isSermonPlaying,
          onClick: onToggleSermon,
        });
      }

      items.push(
        {
          id: 'scroll-up',
          label: '↑',
          title: 'Ir al inicio',
          onClick: onScrollToTop,
        },
        {
          id: 'scroll-down',
          label: '↓',
          title: 'Ir al final',
          onClick: onScrollToBottom,
        },
        {
          id: 'reload',
          label: isReloading ? '…' : '↻',
          title: 'Recargar JSON',
          disabled: isReloading,
          onClick: onReload,
        },
        {
          id: 'print',
          icon: 'print',
          title: 'Descargar PDF',
          disabled: isGeneratingPdf || isReloading,
          onClick: onDownloadPdf,
        },
      );

      return items;
    },
    [
      hasSermon,
      isGeneratingPdf,
      isReloading,
      isSermonLoading,
      isSermonPlaying,
      onDownloadPdf,
      onReload,
      onScrollToBottom,
      onScrollToTop,
      onToggleSermon,
      viewModePickerOpen,
    ],
  );

  useEffect(() => {
    setActivityBarLeftActions(actions);
    return () => clearActivityBarLeftActions();
  }, [actions]);

  const viewModePanel = (
    <VisualizationModePanel
      open={viewModePickerOpen}
      selectedMode={viewMode}
      onSelect={handleSelectViewMode}
      onClose={() => setViewModePickerOpen(false)}
    />
  );

  return { viewModePanel };
}
