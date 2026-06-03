import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function SeriesBackLink() {
  const lang = useSiteLanguage();
  return (
    <nav className="mb-8">
      <a
        href="/series"
        className="text-sm font-medium underline opacity-80 hover:opacity-100"
      >
        ← {getSiteLabel('allPosts', lang)}
      </a>
    </nav>
  );
}
