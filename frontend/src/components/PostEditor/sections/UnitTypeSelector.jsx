import { useEffect, useRef, useState } from 'react';
import { SiteControlButton } from '../../ui';
import { renderUnitTypeIcon } from './UnitTypeIcons';
import { getEditorAddableUnitTypes, getUnitTypeLabel, isUnitType } from './unitTypes';

function getSelectableUnitTypes(currentType) {
  const addable = getEditorAddableUnitTypes();
  if (!currentType || isUnitType(currentType)) {
    const hasCurrent = addable.some((entry) => entry.id === currentType);
    if (!hasCurrent && currentType) {
      return [
        ...addable,
        {
          id: currentType,
          label: getUnitTypeLabel(currentType),
          description: '',
          keyUnit: true,
        },
      ];
    }
  }
  return addable;
}

export default function UnitTypeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const unitTypes = getSelectableUnitTypes(value);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="unit-type-selector" ref={rootRef}>
      <SiteControlButton
        size="bar"
        variant="default"
        className={`section-unit__type-btn ${open ? 'section-unit__type-btn--open' : ''}`.trim()}
        title={`Tipo: ${getUnitTypeLabel(value)}`}
        aria-label={`Tipo de unidad: ${getUnitTypeLabel(value)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        icon={renderUnitTypeIcon(value)}
      />

      {open ? (
        <div
          className="unit-type-selector__menu theme-border theme-surface"
          role="menu"
          aria-label="Seleccionar tipo de unidad"
        >
          <div className="unit-type-selector__grid">
            {unitTypes.map((entry) => (
              <SiteControlButton
                key={entry.id}
                size="bar"
                variant={entry.id === value ? 'primary' : 'default'}
                className="unit-type-selector__option"
                onClick={() => {
                  onChange(entry.id);
                  setOpen(false);
                }}
                title={entry.label}
                aria-label={entry.label}
                aria-current={entry.id === value ? 'true' : undefined}
                icon={renderUnitTypeIcon(entry.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
