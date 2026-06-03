import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';
import SeriesCatalogIndex from './SeriesCatalogIndex';

export default function SeriesIndexPage() {
  const lang = useSiteLanguage();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">{getSiteLabel('seriesIndexTitle', lang)}</h1>
        <p className="theme-muted mt-3 text-lg">
          {getSiteLabel('seriesIndexSubtitle', lang)}
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {getSiteLabel('seriesSection', lang)}
        </h2>
        <SeriesCatalogIndex />
      </section>
    </main>
  );
}
