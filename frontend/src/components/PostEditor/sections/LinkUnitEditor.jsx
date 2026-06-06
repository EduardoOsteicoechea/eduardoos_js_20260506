import { inputClassName } from './editorInputStyles';

export default function LinkUnitEditor({ draft, onChange }) {
  const href = String(draft.href ?? '').trim();
  const text = String(draft.text ?? '').trim();
  const displayText = text || href;

  return (
    <div className="link-unit-editor">
      <input
        id="link-href"
        type="url"
        value={draft.href ?? ''}
        onChange={(event) => onChange({ ...draft, href: event.target.value })}
        placeholder="URL del enlace"
        aria-label="URL del enlace"
        className={inputClassName}
      />

      <input
        id="link-text"
        type="text"
        value={draft.text ?? ''}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
        placeholder="Texto visible"
        aria-label="Texto visible del enlace"
        className={inputClassName}
      />

      {href ? (
        <p className="link-unit-editor__preview">
          Vista previa:{' '}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-unit-editor__preview-link"
          >
            {displayText}
          </a>
        </p>
      ) : null}
    </div>
  );
}
