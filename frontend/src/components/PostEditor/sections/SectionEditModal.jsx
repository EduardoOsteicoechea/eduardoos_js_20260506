import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { addUnitToSection } from './actions/addUnitToSection';
import SectionEditActivityBar from './SectionEditActivityBar';
import SectionUnitEditor from './SectionUnitEditor';
import UnitTypeTray from './UnitTypeTray';
import { inputClassName } from './editorInputStyles';

export default function SectionEditModal({
  section,
  onSave,
  onClose,
  uploadPrefix = '',
  editorPassword = '',
  onRememberPassword,
}) {
  const [draftSection, setDraftSection] = useState(section);
  const [typeTrayOpen, setTypeTrayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftSection(section);
    setTypeTrayOpen(false);
  }, [section]);

  useEffect(() => {
    if (!mounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onClose]);

  const updateUnitData = useCallback((unitId, data) => {
    setDraftSection((previous) => ({
      ...previous,
      content: (previous.content ?? []).map((unit) =>
        unit.id === unitId ? { ...unit, data: { ...unit.data, ...data } } : unit,
      ),
    }));
  }, []);

  const handleAddUnit = (type) => {
    setDraftSection((previous) => ({
      ...previous,
      content: addUnitToSection(type, previous.content ?? []),
    }));
    setTypeTrayOpen(false);
  };

  const handleRemoveUnit = (unitId) => {
    setDraftSection((previous) => ({
      ...previous,
      content: (previous.content ?? []).filter((unit) => unit.id !== unitId),
    }));
  };

  const handleDone = () => {
    onSave(draftSection);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="section-edit-modal">
      <header className="section-edit-modal__header theme-border">
        <div className="section-edit-modal__header-field">
          <p className="section-edit-modal__kicker theme-muted">
            Editar sección
          </p>
          <input
            type="text"
            value={draftSection.heading}
            onChange={(event) =>
              setDraftSection((previous) => ({
                ...previous,
                heading: event.target.value,
              }))
            }
            placeholder="Encabezado de la sección"
            className={inputClassName}
            aria-label="Encabezado de la sección"
          />
        </div>
        <SectionEditActivityBar
          typeTrayOpen={typeTrayOpen}
          onToggleTypeTray={() => setTypeTrayOpen((open) => !open)}
          onClose={handleDone}
        />
      </header>

      <UnitTypeTray open={typeTrayOpen} onSelect={handleAddUnit} />

      <div className="section-edit-modal__body">
        {(draftSection.content ?? []).length === 0 ? (
          <p className="section-edit-modal__empty theme-muted">
            Usa «Añadir unidad» en la barra inferior para crear contenido.
          </p>
        ) : (
          <ul className="section-edit-modal__units">
            {(draftSection.content ?? []).map((unit) => (
              <li key={unit.id}>
                <SectionUnitEditor
                  unit={unit}
                  onCommit={updateUnitData}
                  onRemove={handleRemoveUnit}
                  uploadPrefix={uploadPrefix}
                  editorPassword={editorPassword}
                  onRememberPassword={onRememberPassword}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>,
    document.body,
  );
}
