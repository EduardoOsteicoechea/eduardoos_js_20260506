import { SiteControlButton } from '../../ui';
import { getEditorAddableUnitTypes } from './unitTypes';
import { KeyUnitBadge, renderUnitTypeIcon } from './UnitTypeIcons';

export default function UnitTypeTray({ open, onSelect }) {
  if (!open) return null;

  const unitTypes = getEditorAddableUnitTypes();

  return (
    <div
      className="theme-border theme-surface border-t px-3 py-3"
      role="region"
      aria-label="Unidades clave"
    >
      <p className="theme-muted mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-green-600 text-white dark:bg-green-500">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Unidades clave
      </p>
      <div className="flex flex-wrap gap-2">
        {unitTypes.map((entry) => (
          <SiteControlButton
            key={entry.id}
            size="bar"
            variant="default"
            onClick={() => onSelect(entry.id)}
            title={entry.label}
            aria-label={entry.label}
            className="relative"
            icon={
              <span className="relative inline-flex">
                {renderUnitTypeIcon(entry.id)}
                {entry.keyUnit ? <KeyUnitBadge /> : null}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
}
