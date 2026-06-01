import { UNIT_TYPES } from './unitTypes';

export default function UnitTypeTray({ open, onSelect }) {
  if (!open) return null;

  return (
    <div
      className="theme-border theme-surface border-t px-3 py-3"
      role="region"
      aria-label="Tipos de unidad"
    >
      <p className="theme-muted mb-2 text-xs font-semibold uppercase tracking-wide">
        Elegir tipo
      </p>
      <div className="flex flex-wrap gap-2">
        {UNIT_TYPES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            className="theme-toolbar-btn text-sm"
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}
