import { renderWithEmphasis } from '../../lib/articles/emphasis';

export default function Idea({ text, emphasizedPhrases = [] }) {
  if (!text?.trim()) return null;

  return (
    <p className="article-idea">
      {renderWithEmphasis(text, emphasizedPhrases)}
    </p>
  );
}
