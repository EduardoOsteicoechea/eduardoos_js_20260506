import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';
import SeriesCatalogIndex from './SeriesCatalogIndex';

export default function SeriesIndexPage() {
  const lang = useSiteLanguage();

  return (
    <main className="series-page">
      <section>
        <h2 className="series-posts-heading">
          {getSiteLabel('seriesSection', lang)}
        </h2>
        <SeriesCatalogIndex />
      </section>
    </main>
  );
}
