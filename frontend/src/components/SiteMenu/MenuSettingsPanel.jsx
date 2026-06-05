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
      className="theme-border theme-surface site-menu-settings"
      role="region"
      aria-label="Ajustes de lectura"
    >
      <div className="site-menu-settings__header">
        <h2 className="site-menu-settings__title">
          Ajustes
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="theme-toolbar-btn site-menu-settings__close"
            aria-label="Cerrar ajustes"
            title="Cerrar ajustes"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="site-menu-settings__sections">
        <div>
          <p className="site-menu-settings__section-label theme-muted">
            Tema
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-toolbar-btn site-menu-settings__theme-btn"
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <span aria-hidden="true">{isDark ? '☀' : '☽'}</span>
            <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
          </button>
        </div>

        <div>
          <p className="site-menu-settings__section-label theme-muted">
            Tamaño de fuente
          </p>
          <div className="site-menu-settings__font-row">
            <button
              type="button"
              onClick={onDecreaseFont}
              className="theme-toolbar-btn site-menu-settings__font-btn"
              aria-label="Disminuir tamaño de fuente"
            >
              A−
            </button>
            <span className="site-menu-settings__font-value theme-muted">
              {baseFontSize}
            </span>
            <button
              type="button"
              onClick={onIncreaseFont}
              className="theme-toolbar-btn site-menu-settings__font-btn"
              aria-label="Aumentar tamaño de fuente"
            >
              A+
            </button>
          </div>
        </div>

        <div>
          <p className="site-menu-settings__section-label theme-muted">
            Familia tipográfica
          </p>
          <ul className="site-menu-settings__font-list">
            {FONT_FAMILIES.map((font) => {
              const isSelected = font.id === fontFamilyId;

              return (
                <li key={font.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFont(font.id)}
                    className={`site-menu-settings__font-btn theme-border ${
                      isSelected ? 'site-menu-settings__font-btn--selected' : ''
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
