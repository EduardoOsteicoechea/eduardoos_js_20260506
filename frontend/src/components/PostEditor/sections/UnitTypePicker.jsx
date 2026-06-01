import { UNIT_TYPES } from './unitTypes';

export default function UnitTypePicker({ open, onSelect, onClose }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[200] bg-black/30"
        aria-label="Cerrar selector de unidad"
        onClick={onClose}
      />

      <div
        className="theme-border theme-surface fixed left-1/2 top-1/2 z-[210] w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Elegir tipo de unidad"
      >
        <h3 className="mb-1 text-base font-semibold">Tipo de unidad</h3>
        <p className="theme-muted mb-4 text-sm">
          Elige qué añadir al contenido de la sección.
        </p>

        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {UNIT_TYPES.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                className="theme-border w-full rounded-lg border px-3 py-2.5 text-left transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="block font-medium">{entry.label}</span>
                <span className="theme-muted mt-0.5 block text-xs">
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
