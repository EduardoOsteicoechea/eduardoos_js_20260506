import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function BiblicalQuote({
  text,
  reference,
  emphasizedPhrases = [],
}) {
  if (!text?.trim()) return null;

  return (
    <figure className="my-6 border-l-4 border-blue-600 bg-blue-50/60 py-4 pl-5 pr-4">
      <blockquote className="text-lg italic leading-relaxed text-slate-800">
        {renderWithEmphasis(text, emphasizedPhrases)}
      </blockquote>
      {reference ? (
        <figcaption className="mt-3 text-sm font-semibold text-blue-800">
          — {reference}
        </figcaption>
      ) : null}
    </figure>
  );
}
