export default function Image({ src, alt = '' }) {
  if (!src) return null;

  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg border border-slate-200 shadow-sm"
        loading="lazy"
      />
      {alt ? (
        <figcaption className="mt-2 text-center text-sm text-slate-500">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
