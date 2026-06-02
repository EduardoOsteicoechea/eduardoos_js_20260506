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

export default function SectionUnitEditor({
  unit,
  pendingFile,
  onPendingFileChange,
  onCommit,
  onRemove,
}) {
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
        <MediaUnitEditor
          type={unit.type}
          draft={draft}
          pendingFile={pendingFile}
          onPendingFileChange={onPendingFileChange}
          onChange={setDraft}
        />
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
              className={`${inputClassName} resize-y`}
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
            <p className="theme-muted mt-1 text-xs">
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
      <article className="theme-border rounded-xl border px-4 py-3">
        <div className="flex justify-end">
          <EditorActionButton
            variant="danger"
            className="shrink-0 text-xs"
            onClick={() => onRemove(unit.id)}
            aria-label="Quitar unidad"
          >
            Quitar
          </EditorActionButton>
        </div>
      </article>
    );
  }

  return (
    <article className="theme-border rounded-xl border">
      <div className="flex items-center justify-end px-4 py-2">
        <EditorActionButton
          variant="danger"
          className="shrink-0 text-xs"
          onClick={() => onRemove(unit.id)}
          aria-label="Quitar unidad"
        >
          Quitar
        </EditorActionButton>
      </div>

      <div className="theme-border space-y-4 border-t px-4 py-4">
        {renderEditorFields()}
      </div>
    </article>
  );
}
