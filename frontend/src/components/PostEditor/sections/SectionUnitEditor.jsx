import { useCallback, useEffect, useRef, useState } from 'react';
import { SiteControlButton } from '../../ui';
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
import { TrashIcon } from './UnitTypeIcons';
import UnitTypeSelector from './UnitTypeSelector';
import { inputClassName } from './editorInputStyles';

function UnitEditorSidebar({ unit, onRemove, onChangeType }) {
  return (
    <div className="section-unit__actions">
      <UnitTypeSelector value={unit.type} onChange={onChangeType} />
      <SiteControlButton
        size="bar"
        variant="danger"
        className="section-unit__remove-btn"
        onClick={() => onRemove(unit.id)}
        aria-label="Quitar unidad"
        icon={<TrashIcon />}
      />
    </div>
  );
}

export default function SectionUnitEditor({
  unit,
  onCommit,
  onRemove,
  onChangeType,
  uploadPrefix = '',
  editorPassword = '',
  onRememberPassword,
}) {
  const [draft, setDraft] = useState(() => normalizeUnitData(unit));
  const draftRef = useRef(draft);

  useEffect(() => {
    const next = normalizeUnitData(unit);
    draftRef.current = next;
    setDraft(next);
  }, [unit.id, unit.type]);

  const updateDraft = useCallback(
    (updater) => {
      const previous = draftRef.current;
      const next =
        typeof updater === 'function' ? updater(previous) : updater;

      draftRef.current = next;
      setDraft(next);

      if (unitSupportsEditor(unit.type)) {
        onCommit(unit.id, commitUnitFields(unit, next));
      }
    },
    [unit.id, unit.type, onCommit],
  );

  const handleFieldChange = (field, value) => {
    updateDraft((previous) => ({ ...previous, [field]: value }));
  };

  const renderEditorFields = () => {
    if (unit.type === 'list') {
      return (
        <ListUnitEditor
          items={draft.list ?? []}
          onChange={(list) => updateDraft((previous) => ({ ...previous, list }))}
        />
      );
    }

    if (unitIsMediaType(unit.type)) {
      return (
        <MediaUnitEditor
          type={unit.type}
          draft={draft}
          onChange={(nextDraft) => updateDraft(nextDraft)}
          uploadPrefix={uploadPrefix}
          editorPassword={editorPassword}
          onRememberPassword={onRememberPassword}
        />
      );
    }

    if (unit.type === 'link') {
      return (
        <LinkUnitEditor
          draft={draft}
          onChange={(nextDraft) => updateDraft(nextDraft)}
        />
      );
    }

    if (unitSupportsTextEmphasis(unit.type)) {
      return (
        <>
          <textarea
            id={`${unit.id}-content`}
            value={draft.content ?? ''}
            onChange={(event) =>
              handleFieldChange('content', event.target.value)
            }
            rows={3}
            placeholder="Contenido"
            aria-label="Contenido"
            className={`${inputClassName} post-editor__field--textarea`}
          />

          {unit.type === 'biblical_quote' ? (
            <input
              id={`${unit.id}-reference`}
              type="text"
              value={draft.reference ?? ''}
              onChange={(event) =>
                handleFieldChange('reference', event.target.value)
              }
              placeholder="Referencia bíblica"
              aria-label="Referencia bíblica"
              className={inputClassName}
            />
          ) : null}

          <input
            id={`${unit.id}-emphasized`}
            type="text"
            value={draft.emphasized ?? ''}
            onChange={(event) =>
              handleFieldChange('emphasized', event.target.value)
            }
            placeholder="Texto enfatizado (opcional)"
            aria-label="Texto enfatizado"
            className={inputClassName}
          />
        </>
      );
    }

    return null;
  };

  if (!unitSupportsEditor(unit.type)) {
    return (
      <article className="section-unit theme-border">
        <div className="section-unit__layout">
          <p className="section-unit__unsupported theme-muted">
            Tipo de unidad no editable en el editor.
          </p>
          <UnitEditorSidebar
            unit={unit}
            onRemove={onRemove}
            onChangeType={onChangeType}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="section-unit theme-border">
      <div className="section-unit__layout">
        <div className="section-unit__fields">{renderEditorFields()}</div>
        <UnitEditorSidebar
          unit={unit}
          onRemove={onRemove}
          onChangeType={onChangeType}
        />
      </div>
    </article>
  );
}
