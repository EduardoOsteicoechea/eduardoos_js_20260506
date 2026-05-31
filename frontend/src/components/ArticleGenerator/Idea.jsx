import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function Idea({ text, emphasizedPhrases = [] }) {
  if (!text?.trim()) return null;

  return (
    <p className="mb-4 text-[1.125em] leading-relaxed">
      {renderWithEmphasis(text, emphasizedPhrases)}
    </p>
  );
}
