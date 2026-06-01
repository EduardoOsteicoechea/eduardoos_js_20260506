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
        className="fixed inset-0 bottom-[45px] z-[55] cursor-default bg-transparent"
        aria-label="Cerrar selector de vista"
        onClick={onClose}
      />

      <aside
        className="theme-border theme-surface fixed bottom-[45px] left-0 right-0 z-[60] max-h-[50vh] overflow-y-auto border-t px-4 py-4"
        role="dialog"
        aria-label="Modos de visualización"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
          Modo de visualización
        </h2>

        <div className="grid gap-2">
          {VIEW_MODE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedMode;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                className={`theme-border rounded-lg border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'ring-2 ring-black dark:ring-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span className="block text-base font-semibold">{option.label}</span>
                <span className="theme-muted mt-1 block text-sm">
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
