import type { ReactNode } from 'react';
import { Fragment } from 'react';

/**
 * Wraps emphasized phrases inside plain text with <mark>.
 */
export function renderWithEmphasis(
  text: string,
  emphasizedPhrases: string[] = [],
): ReactNode {
  if (!text) return null;
  if (!emphasizedPhrases?.length) return text;

  const phrases = [...emphasizedPhrases]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let segments: { text: string; emphasized: boolean }[] = [{ text, emphasized: false }];

  for (const phrase of phrases) {
    const next: { text: string; emphasized: boolean }[] = [];

    for (const segment of segments) {
      if (segment.emphasized || !segment.text.includes(phrase)) {
        next.push(segment);
        continue;
      }

      const parts = segment.text.split(phrase);
      parts.forEach((part, index) => {
        if (part) next.push({ text: part, emphasized: false });
        if (index < parts.length - 1) {
          next.push({ text: phrase, emphasized: true });
        }
      });
    }

    segments = next;
  }

  return segments.map((segment, index) =>
    segment.emphasized ? (
      <mark
        key={`${index}-${segment.text}`}
        className="rounded bg-amber-100 px-1 font-medium text-amber-950 not-italic"
      >
        {segment.text}
      </mark>
    ) : (
      <Fragment key={`${index}-${segment.text}`}>{segment.text}</Fragment>
    ),
  );
}
