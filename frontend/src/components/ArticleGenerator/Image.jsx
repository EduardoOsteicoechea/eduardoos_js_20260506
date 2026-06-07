import { resolveMediaUrl } from '../../lib/mediaUrl';

export default function Image({ src, alt = '' }) {
  const resolvedSrc = resolveMediaUrl(src);
  if (!resolvedSrc) return null;

  return (
    <figure className="article-image">
      <img
        src={resolvedSrc}
        alt={alt}
        className="article-image__img theme-border"
        loading="lazy"
      />
      {alt ? (
        <figcaption className="article-image__caption theme-muted">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
