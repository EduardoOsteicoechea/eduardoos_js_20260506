import { inputClassName, labelClassName } from './editorInputStyles';

export default function LinkUnitEditor({ draft, onChange }) {
  const href = String(draft.href ?? '').trim();
  const text = String(draft.text ?? '').trim();
  const displayText = text || href;

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClassName} htmlFor="link-href">
          1. URL
        </label>
        <input
          id="link-href"
          type="url"
          value={draft.href ?? ''}
          onChange={(event) => onChange({ ...draft, href: event.target.value })}
          placeholder="https://ejemplo.com/recurso"
          className={inputClassName}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="link-text">
          2. Texto visible del enlace
        </label>
        <input
          id="link-text"
          type="text"
          value={draft.text ?? ''}
          onChange={(event) => onChange({ ...draft, text: event.target.value })}
          placeholder="Texto que verá el lector"
          className={inputClassName}
        />
      </div>

      {href ? (
        <p className="text-sm">
          Vista previa:{' '}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            {displayText}
          </a>
        </p>
      ) : null}
    </div>
  );
}
