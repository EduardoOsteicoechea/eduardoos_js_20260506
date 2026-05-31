export default function List({ items = [], ordered = false }) {
  if (!items.length) return null;

  const Tag = ordered ? 'ol' : 'ul';
  const listClass = ordered
    ? 'mb-6 list-decimal space-y-2 pl-6 text-[1.125em]'
    : 'mb-6 list-disc space-y-2 pl-6 text-[1.125em]';

  return (
    <Tag className={listClass}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </Tag>
  );
}
