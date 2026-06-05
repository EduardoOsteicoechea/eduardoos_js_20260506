import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { addUnitToSection } from './actions/addUnitToSection';
import SectionEditActivityBar from './SectionEditActivityBar';
import SectionUnitEditor from './SectionUnitEditor';
import UnitTypeTray from './UnitTypeTray';
import { inputClassName } from './editorInputStyles';

export default function SectionEditModal({ section, onSave, onClose }) {
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
    <div className="fixed inset-0 z-[250] flex flex-col bg-white dark:bg-black">
      <header className="theme-border flex shrink-0 items-center gap-3 border-b px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="theme-muted text-xs font-semibold uppercase tracking-wide">
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
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-6">
        {(draftSection.content ?? []).length === 0 ? (
          <p className="theme-muted rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            Usa «Añadir unidad» en la barra inferior para crear contenido.
          </p>
        ) : (
          <ul className="space-y-3">
            {(draftSection.content ?? []).map((unit) => (
              <li key={unit.id}>
                <SectionUnitEditor
                  unit={unit}
                  onCommit={updateUnitData}
                  onRemove={handleRemoveUnit}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0">
        <UnitTypeTray open={typeTrayOpen} onSelect={handleAddUnit} />
        <SectionEditActivityBar
          typeTrayOpen={typeTrayOpen}
          onToggleTypeTray={() => setTypeTrayOpen((open) => !open)}
          onClose={handleDone}
        />
      </div>
    </div>,
    document.body,
  );
}
