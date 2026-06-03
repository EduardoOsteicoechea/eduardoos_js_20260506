import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function SeriesPostsHeading() {
  const lang = useSiteLanguage();
  return <h2 className="mb-4 text-xl font-semibold">{getSiteLabel('posts', lang)}</h2>;
}
