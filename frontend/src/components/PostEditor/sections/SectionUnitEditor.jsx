import { useEffect, useState } from 'react';
import EditorActionButton from '../../EditorActionButton';
import { inputClassName, labelClassName } from './editorInputStyles';
import LinkUnitEditor from './LinkUnitEditor';
import ListUnitEditor from './ListUnitEditor';
import MediaUnitEditor from './MediaUnitEditor';
import {
  commitUnitFields,
  normalizeUnitData,
  unitIsMediaType,
  unitSupportsEditor,
  unitSupportsTextEmphasis,
} from './unitContentModel';

export default function SectionUnitEditor({ unit, onCommit, onRemove }) {
  const normalized = normalizeUnitData(unit);
  const [draft, setDraft] = useState(normalized);

  useEffect(() => {
    setDraft(normalizeUnitData(unit));
  }, [unit]);

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  useEffect(() => {
    if (!unitSupportsEditor(unit.type)) return;
    const committed = commitUnitFields(unit, draft);
    const current = commitUnitFields(unit, normalizeUnitData(unit));
    if (JSON.stringify(committed) === JSON.stringify(current)) return;
    onCommit(unit.id, committed);
  }, [draft, unit, onCommit]);

  const renderEditorFields = () => {
    if (unit.type === 'list') {
      return (
        <ListUnitEditor
          items={draft.list ?? []}
          onChange={(list) => setDraft((previous) => ({ ...previous, list }))}
        />
      );
    }

    if (unitIsMediaType(unit.type)) {
      return (
        <MediaUnitEditor type={unit.type} draft={draft} onChange={setDraft} />
      );
    }

    if (unit.type === 'link') {
      return <LinkUnitEditor draft={draft} onChange={setDraft} />;
    }

    if (unitSupportsTextEmphasis(unit.type)) {
      return (
        <>
          <div>
            <label className={labelClassName} htmlFor={`${unit.id}-content`}>
              1. Contenido
            </label>
            <textarea
              id={`${unit.id}-content`}
              value={draft.content ?? ''}
              onChange={(event) =>
                handleFieldChange('content', event.target.value)
              }
              rows={4}
              className={`${inputClassName} post-editor__field--textarea`}
            />
          </div>

          {unit.type === 'biblical_quote' ? (
            <div>
              <label className={labelClassName} htmlFor={`${unit.id}-reference`}>
                Referencia bíblica
              </label>
              <input
                id={`${unit.id}-reference`}
                type="text"
                value={draft.reference ?? ''}
                onChange={(event) =>
                  handleFieldChange('reference', event.target.value)
                }
                className={inputClassName}
              />
            </div>
          ) : null}

          <div>
            <label className={labelClassName} htmlFor={`${unit.id}-emphasized`}>
              2. Texto enfatizado
            </label>
            <input
              id={`${unit.id}-emphasized`}
              type="text"
              value={draft.emphasized ?? ''}
              onChange={(event) =>
                handleFieldChange('emphasized', event.target.value)
              }
              placeholder="Debe aparecer exactamente en el contenido"
              className={inputClassName}
            />
            <p className="post-editor__hint theme-muted">
              Si coincide con el contenido, se guarda en negrita en el JSON.
            </p>
          </div>
        </>
      );
    }

    return null;
  };

  if (!unitSupportsEditor(unit.type)) {
    return (
      <article className="section-unit theme-border">
        <div className="section-unit__unsupported">
          <div className="section-unit__toolbar">
            <EditorActionButton
              variant="danger"
              className="section-unit__toolbar-btn"
              onClick={() => onRemove(unit.id)}
              aria-label="Quitar unidad"
            >
              Quitar
            </EditorActionButton>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="section-unit theme-border">
      <div className="section-unit__toolbar">
        <EditorActionButton
          variant="danger"
          className="section-unit__toolbar-btn"
          onClick={() => onRemove(unit.id)}
          aria-label="Quitar unidad"
        >
          Quitar
        </EditorActionButton>
      </div>

      <div className="section-unit__body theme-border">
        {renderEditorFields()}
      </div>
    </article>
  );
}
