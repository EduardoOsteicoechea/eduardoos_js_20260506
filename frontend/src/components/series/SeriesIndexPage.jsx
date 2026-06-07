import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';
import SeriesCatalogIndex from './SeriesCatalogIndex';

export default function SeriesIndexPage() {
  const lang = useSiteLanguage();

  return (
    <main className="series-page series-page--wide">
      <header className="series-page__header">
        <h1 className="series-page__title series-page__title--solo">
          {getSiteLabel('seriesIndexTitle', lang)}
        </h1>
        <p className="series-page__description theme-muted">
          {getSiteLabel('seriesIndexSubtitle', lang)}
        </p>
      </header>

      <p className="series-page__catalog-link theme-muted">
        <a href="/catalog">{getSiteLabel('catalog', lang)}</a>
        {' — '}
        {lang === 'es'
          ? 'editar nombres de series y metadatos de secciones.'
          : 'edit series names and section metadata.'}
      </p>

      <section>
        <h2 className="series-posts-heading">
          {getSiteLabel('seriesSection', lang)}
        </h2>
        <SeriesCatalogIndex />
      </section>
    </main>
  );
}
