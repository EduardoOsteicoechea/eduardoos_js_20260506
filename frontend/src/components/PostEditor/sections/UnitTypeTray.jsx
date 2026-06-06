import { SiteControlButton } from '../../ui';
import { getEditorAddableUnitTypes } from './unitTypes';
import { renderUnitTypeIcon } from './UnitTypeIcons';

export default function UnitTypeTray({ open, onSelect }) {
  if (!open) return null;

  const unitTypes = getEditorAddableUnitTypes();

  return (
    <div
      className="unit-type-tray theme-border theme-surface"
      role="region"
      aria-label="Unidades clave"
    >
      <p className="unit-type-tray__label theme-muted">
        <span className="unit-type-tray__badge">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Unidades clave
      </p>
      <div className="unit-type-tray__grid">
        {unitTypes.map((entry) => (
          <SiteControlButton
            key={entry.id}
            size="bar"
            variant="default"
            onClick={() => onSelect(entry.id)}
            title={entry.label}
            aria-label={entry.label}
            className="unit-type-tray__btn"
            icon={renderUnitTypeIcon(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}
