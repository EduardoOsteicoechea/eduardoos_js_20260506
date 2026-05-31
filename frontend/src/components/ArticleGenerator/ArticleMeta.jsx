export default function ArticleMeta({ serie, chapter, creator, slug }) {
  const labels = [
    serie ? `Serie: ${serie}` : null,
    chapter != null ? `Capítulo ${chapter}` : null,
    creator ? `Por ${creator}` : null,
  ].filter(Boolean);

  if (!labels.length && !slug) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
        >
          {label}
        </span>
      ))}
      {slug ? (
        <span className="font-mono text-xs text-slate-400">{slug}</span>
      ) : null}
    </div>
  );
}
