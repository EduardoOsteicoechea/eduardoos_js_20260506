import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function SeriesPostsHeading() {
  const lang = useSiteLanguage();
  return <h2 className="series-posts-heading">{getSiteLabel('posts', lang)}</h2>;
}
