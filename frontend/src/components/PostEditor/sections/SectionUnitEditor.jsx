import { useCallback, useEffect, useRef, useState } from 'react';
import { inputClassName, labelClassName } from './editorInputStyles';
import LinkUnitEditor from './LinkUnitEditor';
import ListUnitEditor from './ListUnitEditor';
import MediaUnitEditor from './MediaUnitEditor';
import { UnitPreviewBody } from './unitPreviewDisplay';
import {
  commitLinkUnitFields,
  commitListUnitFields,
  commitMediaUnitFields,
  commitTextUnitFields,
  commitUnitFields,
  normalizeUnitData,
  unitIsMediaType,
  unitSupportsEditor,
  unitSupportsTextEmphasis,
  unitToEditorPreviewBlock,
} from './unitContentModel';

export default function SectionUnitEditor({
  unit,
  isActive,
  pendingFile,
  onPendingFileChange,
  onActivate,
  onCommit,
  onDeactivate,
  onRemove,
}) {
  const rootRef = useRef(null);
  const normalized = normalizeUnitData(unit);
  const [draft, setDraft] = useState(normalized);

  useEffect(() => {
    if (isActive) {
      setDraft(normalizeUnitData(unit));
    }
  }, [isActive, unit]);

  const finishEditing = useCallback(() => {
    onCommit(unit.id, commitUnitFields(unit, draft));
    onDeactivate();
  }, [unit, draft, onCommit, onDeactivate]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      finishEditing();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isActive, finishEditing]);

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const previewBlock = unitToEditorPreviewBlock({
    ...unit,
    data: unitSupportsEditor(unit.type)
      ? commitUnitFields(unit, draft)
      : unit.data,
  });

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
              autoFocus
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

  return (
    <article
      ref={rootRef}
      className={`theme-border rounded-xl border transition-colors ${
        isActive
          ? 'border-black ring-2 ring-black dark:border-white dark:ring-white'
          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onActivate}
          disabled={isActive}
        >
          <UnitPreviewBody unit={unit} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(unit.id)}
          className="theme-toolbar-btn shrink-0 text-xs"
          aria-label="Quitar unidad"
        >
          Quitar
        </button>
      </div>

      {isActive && unitSupportsEditor(unit.type) ? (
        <div className="theme-border space-y-4 border-t px-4 py-4">
          {renderEditorFields()}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={finishEditing}
              className="theme-toolbar-btn px-4 text-sm"
            >
              Listo
            </button>
          </div>

          <div className="theme-border rounded-lg border bg-black/[0.03] px-3 py-2 dark:bg-white/[0.06]">
            <p className="mb-1 text-xs font-semibold uppercase opacity-60">
              Vista previa de la unidad
            </p>
            <UnitPreviewBody
              unit={{
                ...unit,
                data: commitUnitFields(unit, draft),
              }}
            />
            <pre className="theme-muted mt-2 overflow-x-auto text-[10px]">
              {JSON.stringify(previewBlock, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </article>
  );
}
