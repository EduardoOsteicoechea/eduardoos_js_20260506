import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function BiblicalQuote({
  text,
  reference,
  emphasizedPhrases = [],
}) {
  if (!text?.trim()) return null;

  return (
    <figure className="theme-border my-10 border-l-4 bg-black/[0.03] py-4 pl-5 pr-4 dark:bg-white/[0.05]">
      <blockquote className="text-[1.125em] italic leading-relaxed">
        {renderWithEmphasis(text, emphasizedPhrases)}
      </blockquote>
      {reference ? (
        <figcaption className="theme-muted mt-3 text-[0.875em] font-semibold">
          — {reference}
        </figcaption>
      ) : null}
    </figure>
  );
}
