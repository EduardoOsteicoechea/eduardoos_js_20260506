import { useEffect, useState } from 'react';
import { fetchSeriesCatalog } from '../PostEditor/seriesCatalogApi';
import { formatSegmentLabel } from '../../lib/series/formatSegmentLabel';

/**
 * @param {{ seriesId: string, chapters: string[] }} props
 */
function SeriesCard({ seriesId, chapters }) {
  const label = formatSegmentLabel(seriesId);
  const chapterCount = chapters.length;

  return (
    <li>
      <a href={`/series/${seriesId}`} className="series-catalog__card theme-border">
        {label}
        <span className="series-catalog__slug theme-muted">
          /series/{seriesId}
        </span>
        {chapterCount > 0 ? (
          <span className="series-catalog__desc theme-muted">
            {chapterCount} {chapterCount === 1 ? 'section' : 'sections'}
          </span>
        ) : null}
      </a>
    </li>
  );
}

export default function SeriesCatalogIndex() {
  const [catalog, setCatalog] = useState(
    /** @type {{ series: string[], chapters: Record<string, string[]> } | null} */ (null),
  );
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    let cancelled = false;

    fetchSeriesCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load series catalog',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="series-catalog__error">{error}</p>;
  }

  if (!catalog) {
    return <p className="series-catalog__loading theme-muted">Loading series…</p>;
  }

  if (catalog.series.length === 0) {
    return <p className="series-catalog__empty theme-muted">No series found in the catalog.</p>;
  }

  return (
    <ul className="series-catalog__list">
      {catalog.series.map((seriesId) => (
        <SeriesCard
          key={seriesId}
          seriesId={seriesId}
          chapters={catalog.chapters[seriesId] ?? []}
        />
      ))}
    </ul>
  );
}
