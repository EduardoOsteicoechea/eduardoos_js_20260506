import { getEditorAddableUnitTypes } from './unitTypes';

export default function UnitTypePicker({ open, onSelect, onClose }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="unit-type-picker-overlay"
        aria-label="Cerrar selector de unidad"
        onClick={onClose}
      />

      <div
        className="unit-type-picker-dialog theme-border theme-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Elegir tipo de unidad"
      >
        <h3 className="unit-type-picker-dialog__title">Tipo de unidad</h3>
        <p className="unit-type-picker-dialog__intro theme-muted">
          Elige qué añadir al contenido de la sección.
        </p>

        <ul className="unit-type-picker-dialog__list">
          {getEditorAddableUnitTypes().map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                className="unit-type-picker-dialog__option theme-border"
              >
                <span className="unit-type-picker-dialog__option-label">
                  {entry.label}
                </span>
                <span className="unit-type-picker-dialog__option-desc theme-muted">
                  {entry.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
