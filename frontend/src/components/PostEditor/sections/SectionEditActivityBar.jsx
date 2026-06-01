export default function SectionEditActivityBar({
  typeTrayOpen,
  onToggleTypeTray,
  onClose,
}) {
  return (
    <footer
      className="theme-border theme-surface flex h-[45px] shrink-0 items-center justify-between gap-2 border-t px-3"
      role="toolbar"
      aria-label="Controles de la sección"
    >
      <button
        type="button"
        onClick={onToggleTypeTray}
        className={`theme-toolbar-btn shrink-0 ${
          typeTrayOpen ? 'ring-2 ring-black dark:ring-white' : ''
        }`}
        aria-expanded={typeTrayOpen}
      >
        + Añadir unidad
      </button>

      <button
        type="button"
        onClick={onClose}
        className="theme-toolbar-btn shrink-0 px-4"
      >
        Listo
      </button>
    </footer>
  );
}
