import { UnitPreviewBody } from './unitPreviewDisplay';

export default function SectionUnitsPreview({ units = [] }) {
  if (!units.length) {
    return (
      <p className="theme-muted text-sm italic">Sin unidades en esta sección.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {units.map((unit) => (
        <li key={unit.id}>
          <UnitPreviewBody unit={unit} />
        </li>
      ))}
    </ul>
  );
}
