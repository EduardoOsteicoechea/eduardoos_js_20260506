export default function ArticleMeta({ serie, chapter, creator, slug }) {
  const labels = [
    serie ? `Serie: ${serie}` : null,
    chapter != null ? `Capítulo ${chapter}` : null,
    creator ? `Por ${creator}` : null,
  ].filter(Boolean);

  if (!labels.length && !slug) return null;

  return (
    <div className="theme-muted mb-6 flex flex-wrap items-center gap-2 text-sm">
      {labels.map((label) => (
        <span
          key={label}
          className="theme-border rounded-full border px-3 py-1 font-medium"
        >
          {label}
        </span>
      ))}
      {slug ? (
        <span className="font-mono text-xs opacity-50">{slug}</span>
      ) : null}
    </div>
  );
}
