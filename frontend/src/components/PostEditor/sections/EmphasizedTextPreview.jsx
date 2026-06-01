export default function EmphasizedTextPreview({ content, emphasized }) {
  const text = String(content ?? '');
  const phrase = String(emphasized ?? '').trim();

  if (!text) {
    return <span className="theme-muted italic">Sin contenido</span>;
  }

  if (!phrase || !text.includes(phrase)) {
    return <span>{text}</span>;
  }

  const start = text.indexOf(phrase);
  const end = start + phrase.length;

  return (
    <span>
      {text.slice(0, start)}
      <strong className="font-semibold">{phrase}</strong>
      {text.slice(end)}
    </span>
  );
}
