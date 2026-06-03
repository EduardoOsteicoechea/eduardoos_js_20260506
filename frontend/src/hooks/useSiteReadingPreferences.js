import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  ensureReadingPreferencesHydrated,
  decreaseReadingFontSize,
  getReadingPreferencesRevision,
  getReadingPreferencesSnapshot,
  increaseReadingFontSize,
  setReadingFontFamily,
  subscribeReadingPreferences,
  toggleReadingTheme,
} from '../lib/readingPreferencesStore';

/**
 * Shared theme / font size / font family state for SiteMenu (and article reader).
 */
export function useSiteReadingPreferences() {
  useEffect(() => {
    ensureReadingPreferencesHydrated();
  }, []);

  useSyncExternalStore(
    subscribeReadingPreferences,
    getReadingPreferencesRevision,
    () => 0,
  );

  const snapshot = getReadingPreferencesSnapshot();

  const onToggleTheme = useCallback(() => {
    toggleReadingTheme();
  }, []);

  const onIncreaseFont = useCallback(() => {
    increaseReadingFontSize();
  }, []);

  const onDecreaseFont = useCallback(() => {
    decreaseReadingFontSize();
  }, []);

  const onSelectFont = useCallback((id) => {
    setReadingFontFamily(id);
  }, []);

  return {
    ready: snapshot.ready,
    theme: snapshot.theme,
    fontFamilyId: snapshot.fontFamilyId,
    baseFontSize: snapshot.baseFontSize,
    onToggleTheme,
    onIncreaseFont,
    onDecreaseFont,
    onSelectFont,
  };
}
