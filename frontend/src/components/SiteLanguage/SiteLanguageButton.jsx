import { SiteControlButton } from '../ui';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { toggleSitePageLanguage } from '../../lib/sitePageLanguage';

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export default function SiteLanguageButton() {
  const lang = useSiteLanguage();

  return (
    <SiteControlButton
      size="bar"
      label={lang.toUpperCase()}
      icon={<GlobeIcon />}
      className="ui-control--icon-label tracking-wide"
      onClick={() => toggleSitePageLanguage()}
      title={
        lang === 'en'
          ? 'Cambiar sitio a español'
          : 'Switch site to English'
      }
      aria-label={
        lang === 'en'
          ? 'Cambiar idioma del sitio a español'
          : 'Switch site language to English'
      }
    />
  );
}
