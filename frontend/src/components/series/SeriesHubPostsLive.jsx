import { useEffect, useState } from 'react';
import { getHubPostLinks } from '../../lib/articles/hubPostLinks';
import { buildArticleApiPath } from '../../lib/articles/articleApi';

/**
 * Hub post list that always reflects the live deploy database via /api/series/discover.
 */
export default function SeriesHubPostsLive({ hubSlug, hub, initialPosts }) {
  const [posts, setPosts] = useState(initialPosts ?? []);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch('/api/series/discover', { cache: 'no-store' });
        if (!response.ok) return;

        const payload = await response.json();
        const articles = (payload.articles ?? []).map((entry) => ({
          slug: entry.slug,
          data: entry.data,
          dataPath: buildArticleApiPath(entry.slug),
          sermonPath: entry.sermon_url || undefined,
        }));

        const hubs = payload.hubs ?? [];
        const liveHub =
          hubs.find((entry) => entry.slug === hubSlug)?.data ?? hub;

        if (!cancelled) {
          setPosts(getHubPostLinks(hubSlug, liveHub, articles));
        }
      } catch {
        // Keep SSR fallback list when the API is unreachable.
      }
    }

    refresh();
    return () => {
      cancelled = true;
    };
  }, [hubSlug, hub]);

  return (
    <ul className="series-card-list">
      {posts.map((post) => (
        <li key={post.slug}>
          {post.href ? (
            <a href={post.href} className="series-card theme-border">
              <span className="series-card__title">
                {post.articleTitle ?? post.contribution}
              </span>
              {post.abstract ? (
                <p className="series-card__description theme-muted">{post.abstract}</p>
              ) : null}
              <span className="series-card__meta theme-muted">{post.contribution}</span>
            </a>
          ) : (
            <div className="series-card series-card--disabled theme-border">
              <span className="series-card__title">{post.contribution}</span>
              {post.abstract ? (
                <p className="series-card__description theme-muted">{post.abstract}</p>
              ) : null}
              <span className="series-card__meta theme-muted">Próximamente</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
