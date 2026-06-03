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
      <a
        href={`/series/${seriesId}`}
        className="theme-border block rounded-lg border px-5 py-4 font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        {label}
        <span className="theme-muted mt-1 block font-mono text-xs font-normal">
          /series/{seriesId}
        </span>
        {chapterCount > 0 ? (
          <span className="theme-muted mt-2 block text-sm font-normal">
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
    return (
      <p className="theme-muted rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (!catalog) {
    return <p className="theme-muted text-sm">Loading series…</p>;
  }

  if (catalog.series.length === 0) {
    return (
      <p className="theme-muted">No series found in the catalog.</p>
    );
  }

  return (
    <ul className="space-y-3">
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
