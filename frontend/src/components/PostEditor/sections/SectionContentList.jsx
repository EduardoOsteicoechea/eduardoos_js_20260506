import { getUnitTypeLabel } from './unitTypes';
import { unitToPreviewBlock } from './unitToContentBlock';

function summarizeUnit(unit) {
  const { type, data } = unit;

  switch (type) {
    case 'paragraph':
    case 'key_idea':
      return String(data.text ?? '').trim() || 'Sin texto';
    case 'list':
      return `${(data.list ?? []).filter((item) => String(item).trim()).length} elementos`;
    case 'biblical_quote':
      return String(data.biblical_reference ?? '').trim() || 'Sin referencia';
    case 'image':
      return String(data.image ?? '').trim() || 'Sin URL';
    case 'video':
      return String(data.video ?? '').trim() || 'Sin URL';
    case 'audio':
      return String(data.audio ?? '').trim() || 'Sin URL';
    case 'link':
      return String(data.href ?? '').trim() || 'Sin URL';
    default:
      return '';
  }
}

export default function SectionContentList({ units = [], onRemoveUnit }) {
  if (!units.length) {
    return (
      <p className="theme-muted rounded-lg border border-dashed px-3 py-4 text-sm">
        Aún no hay unidades en esta sección. Usa «Añadir unidad» para empezar.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {units.map((unit, index) => (
        <li
          key={unit.id}
          className="theme-border rounded-lg border px-3 py-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {index + 1}. {getUnitTypeLabel(unit.type)}
              </p>
              <p className="theme-muted mt-1 truncate text-sm">
                {summarizeUnit(unit)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveUnit(unit.id)}
              className="theme-toolbar-btn shrink-0 text-xs"
              aria-label={`Quitar unidad ${index + 1}`}
            >
              Quitar
            </button>
          </div>
          <pre className="theme-muted mt-2 overflow-x-auto text-[10px] leading-relaxed opacity-80">
            {JSON.stringify(unitToPreviewBlock(unit), null, 2)}
          </pre>
        </li>
      ))}
    </ul>
  );
}
