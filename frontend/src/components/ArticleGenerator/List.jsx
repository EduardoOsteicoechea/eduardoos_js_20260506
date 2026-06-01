import { renderWithEmphasis } from '../../lib/articles/emphasis';

function renderListItem(item) {
  if (typeof item === 'string') {
    return item;
  }

  if (item && typeof item === 'object' && 'text' in item) {
    const { text, emphasized_phrases: emphasizedPhrases } = item;
    return renderWithEmphasis(String(text ?? ''), emphasizedPhrases ?? []);
  }

  return null;
}

export default function List({ items = [], ordered = false }) {
  if (!items.length) return null;

  const Tag = ordered ? 'ol' : 'ul';
  const listClass = ordered
    ? 'mb-6 list-decimal space-y-2 pl-6 text-[1.125em]'
    : 'mb-6 list-disc space-y-2 pl-6 text-[1.125em]';

  return (
    <Tag className={listClass}>
      {items.map((item, index) => {
        const rendered = renderListItem(item);
        if (rendered == null) return null;

        const key =
          typeof item === 'string'
            ? `${index}-${item}`
            : `${index}-${item.text ?? ''}`;

        return <li key={key}>{rendered}</li>;
      })}
    </Tag>
  );
}
