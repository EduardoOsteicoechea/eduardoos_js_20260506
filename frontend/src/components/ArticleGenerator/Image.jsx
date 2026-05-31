export default function Image({ src, alt = '' }) {
  if (!src) return null;

  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt}
        className="theme-border w-full rounded-lg border"
        loading="lazy"
      />
      {alt ? (
        <figcaption className="theme-muted mt-2 text-center text-sm">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
