import { useEffect, useMemo, useState } from 'react';
import ArticleViewer from '../ArticleGenerator/ArticleViewer';
import SeriesBackLink from './SeriesBackLink';
import SeriesBreadcrumbs from './SeriesBreadcrumbs';
import SeriesEmptyMessage from './SeriesEmptyMessage';
import SeriesHubPostsLive from './SeriesHubPostsLive';
import SeriesPostsHeading from './SeriesPostsHeading';
import { buildArticleApiPath } from '../../lib/articles/articleApi';
import { resolveSeriesRouteCore } from '../../lib/articles/resolveSeriesRouteCore';

function SeriesChildList({ items }) {
  if (!items.length) {
    return <SeriesEmptyMessage />;
  }

  return (
    <ul className="series-card-list">
      {items.map((child) => (
        <li key={child.slug}>
          <a href={`/series/${child.slug}`} className="series-card theme-border">
            <span className="series-card__title">{child.label}</span>
            {child.description ? (
              <p className="series-card__description theme-muted">{child.description}</p>
            ) : null}
            <span className="series-card__slug theme-muted">/series/{child.slug}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function readSlugFromPathname() {
  const match = window.location.pathname.match(/^\/series\/(.+?)\/?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function SeriesRouteClient({ initialRoute = null }) {
  const [route, setRoute] = useState(initialRoute);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!initialRoute);

  const slug = useMemo(() => {
    if (typeof window === 'undefined') return initialRoute?.slug ?? '';
    return readSlugFromPathname();
  }, [initialRoute?.slug]);

  useEffect(() => {
    if (!slug) {
      setError('Ruta de serie no válida.');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/series/discover', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`No se pudo cargar el índice (${response.status})`);
        }

        const payload = await response.json();
        const articles = (payload.articles ?? []).map((entry) => ({
          slug: entry.slug,
          data: entry.data,
          dataPath: buildArticleApiPath(entry.slug),
          sermonPath: entry.sermon_url || undefined,
        }));
        const hubs = (payload.hubs ?? []).map((entry) => ({
          slug: entry.slug,
          data: entry.data,
        }));

        if (!cancelled) {
          setRoute(resolveSeriesRouteCore(slug, articles, hubs));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'No se pudo cargar esta serie',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <p className="series-catalog__loading theme-muted">Cargando serie…</p>;
  }

  if (error) {
    return <p className="series-catalog__error">{error}</p>;
  }

  if (!route) {
    return <p className="series-catalog__error">No se encontró esta ruta.</p>;
  }

  if (route.routeKind === 'article') {
    return (
      <main className="series-page series-page--article">
        <SeriesBackLink />
        <ArticleViewer
          initialArticle={route.article}
          slug={route.slug}
          articleApiPath={route.articleApiPath}
          sermonPath={route.sermonPath}
        />
      </main>
    );
  }

  if (route.routeKind === 'hub') {
    return (
      <main className="series-page series-page--wide">
        <SeriesBreadcrumbs
          crumbs={route.breadcrumbs}
          currentLabel={route.pageTitle}
        />
        <header className="series-page__header">
          <p className="series-page__kicker theme-muted">
            {route.hub.series ? `Serie ${route.hub.series}` : 'Series'}
          </p>
          <h1 className="series-page__title">{route.pageTitle}</h1>
          {route.hub.description ? (
            <p className="series-page__description theme-muted">
              {route.hub.description}
            </p>
          ) : null}
          {route.hub.purpose ? (
            <p className="series-page__purpose">{route.hub.purpose}</p>
          ) : null}
        </header>

        {route.hub.biblical_texts?.length ? (
          <section className="series-biblical theme-border">
            <h2 className="series-biblical__title">Texto bíblico</h2>
            <ul className="series-biblical__list">
              {route.hub.biblical_texts.map((item, index) => (
                <li key={index}>
                  {item.text ? <p className="series-biblical__text">{item.text}</p> : null}
                  {item.reference ? (
                    <p className="series-biblical__reference theme-muted">
                      {item.reference}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <SeriesPostsHeading />
          <SeriesHubPostsLive
            hubSlug={route.slug}
            hub={route.hub}
            initialPosts={route.hubPosts}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="series-page series-page--wide">
      <SeriesBreadcrumbs crumbs={route.breadcrumbs} currentLabel={route.pageTitle} />
      <header className="series-page__header">
        <h1 className="series-page__title series-page__title--solo">
          {route.pageTitle}
        </h1>
      </header>
      <SeriesChildList items={route.children} />
    </main>
  );
}
