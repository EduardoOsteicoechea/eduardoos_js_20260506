import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function Idea({ text, emphasizedPhrases = [] }) {
  if (!text?.trim()) return null;

  return (
    <p className="mb-4 text-lg leading-relaxed text-slate-700">
      {renderWithEmphasis(text, emphasizedPhrases)}
    </p>
  );
}
