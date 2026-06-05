import { FONT_FAMILIES } from '../../lib/fonts';

export default function FontPickerPanel({
  open,
  selectedFontId,
  onSelect,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="font-picker-backdrop"
        aria-label="Cerrar selector de fuente"
        onClick={onClose}
      />

      <aside
        className="font-picker-panel theme-border theme-surface"
        role="dialog"
        aria-label="Selector de fuente"
      >
        <h2 className="font-picker-panel__title">
          Fuente
        </h2>

        <div className="font-picker-panel__grid">
          {FONT_FAMILIES.map((font) => {
            const isSelected = font.id === selectedFontId;

            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onSelect(font.id)}
                className={`font-picker-panel__option theme-border ${
                  isSelected ? 'font-picker-panel__option--selected' : ''
                }`}
                style={{ fontFamily: font.stack }}
              >
                <span className="font-picker-panel__option-label">{font.label}</span>
                <span className="font-picker-panel__option-meta theme-muted">
                  The quick brown fox jumps over the lazy dog.
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
