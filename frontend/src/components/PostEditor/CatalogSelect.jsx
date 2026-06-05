import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { previewSlug } from './catalogHelpers';
import { normalizeKebabInput } from './slugify';

const NEW_OPTION = '__new__';

const inputClassName = UI_FIELD_CLASS;

const selectClassName = `${inputClassName} post-editor__field--select`;

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
  const canCommit = isCustom && previewSlug(customValue).length > 0;

  const handleCommit = () => {
    if (!canCommit || !onCommitCustom) return;
    onCommitCustom(customValue);
  };

  return (
    <div className="catalog-select">
      <label htmlFor={id} className="post-editor__label">
        {label}
      </label>
      <div className="post-editor__select-wrap">
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
          className={selectClassName}
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
        <span aria-hidden="true" className="post-editor__select-chevron">
          ▼
        </span>
      </div>

      {isCustom ? (
        <div className="catalog-select__custom">
          <input
            type="text"
            value={customValue}
            disabled={disabled}
            onChange={(event) =>
              onCustomValueChange(normalizeKebabInput(event.target.value))
            }
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
          {onCommitCustom ? (
            <button
              type="button"
              disabled={disabled || !canCommit}
              onClick={handleCommit}
              className="theme-toolbar-btn catalog-select__commit"
            >
              Añadir {label.toLowerCase()}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
