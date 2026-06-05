export default function ArticleMeta({ serie, chapter, creator, slug }) {
  const labels = [
    serie ? `Serie: ${serie}` : null,
    chapter != null ? `Capítulo ${chapter}` : null,
    creator ? `Por ${creator}` : null,
  ].filter(Boolean);

  if (!labels.length && !slug) return null;

  return (
    <div className="article-meta theme-muted">
      {labels.map((label) => (
        <span key={label} className="article-meta__tag theme-border">
          {label}
        </span>
      ))}
      {slug ? (
        <span className="article-meta__slug">{slug}</span>
      ) : null}
    </div>
  );
}
