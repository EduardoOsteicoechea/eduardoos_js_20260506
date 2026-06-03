import EditorActionButton from '../../EditorActionButton';

export default function SectionEditActivityBar({
  typeTrayOpen,
  onToggleTypeTray,
  onClose,
}) {
  return (
    <footer
      className="theme-border theme-surface flex h-[var(--activity-bar-height)] shrink-0 items-center justify-between gap-2 border-t px-3"
      role="toolbar"
      aria-label="Controles de la sección"
    >
      <EditorActionButton
        variant="primary"
        className={`shrink-0 ${typeTrayOpen ? 'ring-2 ring-black dark:ring-white' : ''}`}
        onClick={onToggleTypeTray}
        aria-expanded={typeTrayOpen}
      >
        + Añadir unidad
      </EditorActionButton>

      <EditorActionButton variant="success" className="shrink-0 px-4" onClick={onClose}>
        Listo
      </EditorActionButton>
    </footer>
  );
}
