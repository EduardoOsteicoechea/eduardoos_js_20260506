import { UnitPreviewBody } from './unitPreviewDisplay';

export default function SectionUnitsPreview({ units = [] }) {
  if (!units.length) {
    return (
      <p className="section-units-preview__empty theme-muted">
        Sin unidades en esta sección.
      </p>
    );
  }

  return (
    <ul className="section-units-preview__list">
      {units.map((unit) => (
        <li key={unit.id}>
          <UnitPreviewBody unit={unit} />
        </li>
      ))}
    </ul>
  );
}
