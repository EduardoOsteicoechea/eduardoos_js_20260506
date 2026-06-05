export default function Image({ src, alt = '' }) {
  if (!src) return null;

  return (
    <figure className="article-image">
      <img
        src={src}
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
