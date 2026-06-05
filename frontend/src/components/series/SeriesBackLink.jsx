import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function SeriesBackLink() {
  const lang = useSiteLanguage();
  return (
    <nav>
      <a href="/series" className="series-back-link">
        ← {getSiteLabel('allPosts', lang)}
      </a>
    </nav>
  );
}
