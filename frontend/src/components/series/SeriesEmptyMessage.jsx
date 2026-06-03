import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function SeriesEmptyMessage() {
  const lang = useSiteLanguage();
  return <p className="theme-muted">{getSiteLabel('noPostsHere', lang)}</p>;
}
