import { FONT_FAMILIES } from '../../lib/fonts';
import { THEMES } from '../../lib/preferences';

export default function MenuSettingsPanel({
  theme,
  fontFamilyId,
  baseFontSize,
  onToggleTheme,
  onIncreaseFont,
  onDecreaseFont,
  onSelectFont,
  onClose,
}) {
  const isDark = theme === THEMES.dark;

  return (
    <div
      className="theme-border theme-surface site-menu-settings flex h-full min-h-0 flex-col overflow-y-auto border-l px-4 py-4"
      role="region"
      aria-label="Ajustes de lectura"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
          Ajustes
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="theme-toolbar-btn h-8 w-8 shrink-0 border-red-500/60 bg-red-500/10 p-0 text-2xl font-bold leading-none text-red-600 hover:bg-red-500/20 dark:text-red-400"
            aria-label="Cerrar ajustes"
            title="Cerrar ajustes"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <p className="theme-muted mb-2 text-xs font-medium uppercase tracking-wide">
            Tema
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-toolbar-btn w-full justify-center gap-2"
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <span aria-hidden="true">{isDark ? '☀' : '☽'}</span>
            <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
          </button>
        </div>

        <div>
          <p className="theme-muted mb-2 text-xs font-medium uppercase tracking-wide">
            Tamaño de fuente
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecreaseFont}
              className="theme-toolbar-btn flex-1"
              aria-label="Disminuir tamaño de fuente"
            >
              A−
            </button>
            <span className="theme-muted min-w-[3ch] text-center text-sm tabular-nums">
              {baseFontSize}
            </span>
            <button
              type="button"
              onClick={onIncreaseFont}
              className="theme-toolbar-btn flex-1"
              aria-label="Aumentar tamaño de fuente"
            >
              A+
            </button>
          </div>
        </div>

        <div>
          <p className="theme-muted mb-2 text-xs font-medium uppercase tracking-wide">
            Familia tipográfica
          </p>
          <ul className="space-y-2">
            {FONT_FAMILIES.map((font) => {
              const isSelected = font.id === fontFamilyId;

              return (
                <li key={font.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFont(font.id)}
                    className={`theme-border w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? 'ring-2 ring-black dark:ring-white'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    style={{ fontFamily: font.stack }}
                  >
                    {font.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
