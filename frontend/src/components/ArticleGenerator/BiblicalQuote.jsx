import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function BiblicalQuote({
  text,
  reference,
  emphasizedPhrases = [],
}) {
  if (!text?.trim()) return null;

  return (
    <figure className="article-biblical-quote theme-border">
      <blockquote className="article-biblical-quote__text">
        {renderWithEmphasis(text, emphasizedPhrases)}
      </blockquote>
      {reference ? (
        <figcaption className="article-biblical-quote__reference theme-muted">
          — {reference}
        </figcaption>
      ) : null}
    </figure>
  );
}
