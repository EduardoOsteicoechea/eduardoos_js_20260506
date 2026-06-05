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
      <p className="section-content-list__empty theme-muted">
        Aún no hay unidades en esta sección. Usa «Añadir unidad» para empezar.
      </p>
    );
  }

  return (
    <ul className="section-content-list__items">
      {units.map((unit, index) => (
        <li key={unit.id} className="section-content-list__item theme-border">
          <div className="section-content-list__item-header">
            <div className="section-content-list__item-body">
              <p className="section-content-list__item-type">
                {index + 1}. {getUnitTypeLabel(unit.type)}
              </p>
              <p className="section-content-list__item-summary theme-muted">
                {summarizeUnit(unit)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveUnit(unit.id)}
              className="theme-toolbar-btn section-content-list__item-remove"
              aria-label={`Quitar unidad ${index + 1}`}
            >
              Quitar
            </button>
          </div>
          <pre className="section-content-list__item-json theme-muted">
            {JSON.stringify(unitToPreviewBlock(unit), null, 2)}
          </pre>
        </li>
      ))}
    </ul>
  );
}
