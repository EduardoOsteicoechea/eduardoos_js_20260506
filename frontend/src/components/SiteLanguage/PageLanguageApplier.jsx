import { useEffect } from 'react';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { applySitePageLanguage } from '../../lib/sitePageLanguage';

/** Keeps static [data-i18n] markup in sync with the selected site language. */
export default function PageLanguageApplier() {
  const lang = useSiteLanguage();

  useEffect(() => {
    applySitePageLanguage(lang);
  }, [lang]);

  return null;
}
