import { useState } from 'react';
import { THEMES } from '../../lib/preferences';
import FontPickerPanel from './FontPickerPanel';

export default function ArticleActivityBar({
  theme,
  fontFamilyId,
  onToggleTheme,
  onIncreaseFont,
  onDecreaseFont,
  onExpandAll,
  onCollapseAll,
  onReload,
  onSelectFont,
  isReloading = false,
}) {
  const isDark = theme === THEMES.dark;
  const [fontPickerOpen, setFontPickerOpen] = useState(false);

  const handleSelectFont = (id) => {
    onSelectFont(id);
    setFontPickerOpen(false);
  };

  return (
    <>
      <FontPickerPanel
        open={fontPickerOpen}
        selectedFontId={fontFamilyId}
        onSelect={handleSelectFont}
        onClose={() => setFontPickerOpen(false)}
      />

      <footer
        className="theme-border theme-surface fixed bottom-0 left-0 right-0 z-50 h-[45px] overflow-x-auto overflow-y-hidden border-t"
        role="toolbar"
        aria-label="Controles del artículo"
      >
        <div className="flex h-full min-w-max items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => setFontPickerOpen((open) => !open)}
            className={`theme-toolbar-btn shrink-0 ${fontPickerOpen ? 'ring-2 ring-black dark:ring-white' : ''}`}
            aria-label="Elegir fuente"
            aria-expanded={fontPickerOpen}
            title="Elegir fuente"
          >
            Aa
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-toolbar-btn shrink-0"
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={isDark ? 'Tema claro' : 'Tema oscuro'}
          >
            {isDark ? '☀' : '☽'}
          </button>

          <button
            type="button"
            onClick={onDecreaseFont}
            className="theme-toolbar-btn shrink-0"
            aria-label="Disminuir tamaño de fuente"
            title="Disminuir tamaño de fuente"
          >
            A−
          </button>

          <button
            type="button"
            onClick={onIncreaseFont}
            className="theme-toolbar-btn shrink-0"
            aria-label="Aumentar tamaño de fuente"
            title="Aumentar tamaño de fuente"
          >
            A+
          </button>

          <button
            type="button"
            onClick={onExpandAll}
            className="theme-toolbar-btn shrink-0"
            aria-label="Expandir todas las secciones"
            title="Expandir todas las secciones"
          >
            + All
          </button>

          <button
            type="button"
            onClick={onCollapseAll}
            className="theme-toolbar-btn shrink-0"
            aria-label="Colapsar todas las secciones"
            title="Colapsar todas las secciones"
          >
            − All
          </button>

          <button
            type="button"
            onClick={onReload}
            disabled={isReloading}
            className="theme-toolbar-btn shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Recargar artículo desde JSON"
            title="Recargar JSON"
          >
            {isReloading ? '…' : '↻ JSON'}
          </button>
        </div>
      </footer>
    </>
  );
}
