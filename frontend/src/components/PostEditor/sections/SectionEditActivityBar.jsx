import { SiteControlButton } from '../../ui';
import { AddUnitIcon, DoneIcon } from './UnitTypeIcons';

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
      <SiteControlButton
        size="bar"
        variant="primary"
        active={typeTrayOpen}
        onClick={onToggleTypeTray}
        aria-expanded={typeTrayOpen}
        title="Añadir unidad"
        aria-label="Añadir unidad"
        icon={<AddUnitIcon />}
      />

      <SiteControlButton
        size="bar"
        variant="success"
        onClick={onClose}
        title="Listo"
        aria-label="Listo"
        icon={<DoneIcon />}
      />
    </footer>
  );
}
