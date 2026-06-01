import { previewSlug } from './catalogHelpers';

const NEW_OPTION = '__new__';

const inputClassName =
  'theme-border w-full rounded-lg border bg-transparent px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

export default function CatalogSelect({
  id,
  label,
  options = [],
  value,
  isCustom,
  customValue,
  disabled = false,
  newOptionLabel,
  customPlaceholder,
  onSelectExisting,
  onEnableCustom,
  onCustomValueChange,
  onCommitCustom,
}) {
  const selectValue = isCustom ? NEW_OPTION : value || '';
  const resolvedSlug = previewSlug(customValue);
  const canCommit = isCustom && resolvedSlug.length > 0;

  const handleCommit = () => {
    if (!canCommit || !onCommitCustom) return;
    onCommitCustom(customValue);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        disabled={disabled}
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          if (next === NEW_OPTION) {
            onEnableCustom();
            return;
          }
          onSelectExisting(next);
        }}
        className={inputClassName}
      >
        <option value="" disabled>
          Seleccionar…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={NEW_OPTION}>{newOptionLabel}</option>
      </select>

      {isCustom ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={customValue}
            disabled={disabled}
            onChange={(event) => onCustomValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleCommit();
              }
            }}
            placeholder={customPlaceholder}
            className={inputClassName}
            aria-label={`${label} nueva`}
          />
          <p className="theme-muted text-xs">
            {resolvedSlug
              ? `En el JSON: "${resolvedSlug}"`
              : 'Escribe un nombre para ver la vista previa'}
          </p>
          {onCommitCustom ? (
            <button
              type="button"
              disabled={disabled || !canCommit}
              onClick={handleCommit}
              className="theme-toolbar-btn w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Añadir {label.toLowerCase()}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
