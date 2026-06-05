import EditorActionButton from '../../EditorActionButton';

export default function SectionEditActivityBar({
  typeTrayOpen,
  onToggleTypeTray,
  onClose,
}) {
  return (
    <div className="section-edit-bar theme-border theme-surface">
      <EditorActionButton
        variant={typeTrayOpen ? 'primary' : 'default'}
        onClick={onToggleTypeTray}
      >
        Añadir unidad
      </EditorActionButton>
      <EditorActionButton variant="success" onClick={onClose}>
        Listo
      </EditorActionButton>
    </div>
  );
}
