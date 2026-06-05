import { VIEW_MODE_OPTIONS } from '../../lib/viewModes';

export default function VisualizationModePanel({
  open,
  selectedMode,
  onSelect,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="viz-mode-panel__backdrop"
        aria-label="Cerrar selector de vista"
        onClick={onClose}
      />

      <aside
        className="viz-mode-panel__sheet theme-border theme-surface"
        role="dialog"
        aria-label="Modos de visualización"
      >
        <h2 className="viz-mode-panel__title">
          Modo de visualización
        </h2>

        <div className="viz-mode-panel__options">
          {VIEW_MODE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedMode;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                className={`viz-mode-panel__option theme-border ${
                  isSelected ? 'viz-mode-panel__option--selected' : ''
                }`}
              >
                <span className="viz-mode-panel__option-label">{option.label}</span>
                <span className="viz-mode-panel__option-desc theme-muted">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
