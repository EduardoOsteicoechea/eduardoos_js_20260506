import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PUBLIC_NAV_LINKS } from '../../lib/siteNav';
import MenuSettingsPanel from './MenuSettingsPanel';
import { HamburgerIcon, LoginIcon, ProfileIcon, SettingsIcon } from './MenuIcons';

function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

export default function SiteMenu({
  theme,
  fontFamilyId,
  baseFontSize,
  onToggleTheme,
  onIncreaseFont,
  onDecreaseFont,
  onSelectFont,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSettingsOpen(false);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettingsOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (settingsOpen) {
        setSettingsOpen(false);
      } else {
        closeMenu();
      }
    };

    lockBodyScroll();
    window.addEventListener('keydown', onKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, settingsOpen, closeMenu]);

  const menuLayer =
    menuOpen && mounted ? (
      <>
        <button
          type="button"
          className="site-menu-backdrop fixed inset-0 z-[200] bg-black/40"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />

        <div
          className="site-menu-drawer fixed top-0 right-0 z-[210] flex h-[100dvh] min-h-[100svh] w-[min(100vw,20rem)] flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menú del sitio"
        >
          <aside className="theme-border theme-surface site-menu-tray relative flex h-full min-h-0 flex-1 flex-col overflow-hidden border-l shadow-xl">
            <header className="theme-border flex shrink-0 items-center justify-around border-b px-3 py-3">
              <button
                type="button"
                disabled
                className="theme-toolbar-btn opacity-40"
                aria-label="Perfil (próximamente)"
                title="Perfil (próximamente)"
              >
                <ProfileIcon />
              </button>

              <button
                type="button"
                disabled
                className="theme-toolbar-btn opacity-40"
                aria-label="Iniciar sesión (próximamente)"
                title="Iniciar sesión (próximamente)"
              >
                <LoginIcon />
              </button>

              <button
                type="button"
                onClick={toggleSettings}
                className={`theme-toolbar-btn ${
                  settingsOpen ? 'ring-2 ring-black dark:ring-white' : ''
                }`}
                aria-label="Ajustes de lectura"
                aria-expanded={settingsOpen}
                title="Ajustes"
              >
                <SettingsIcon />
              </button>
            </header>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Navegación">
              <ul className="space-y-1">
                {PUBLIC_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="theme-border block rounded-lg border px-4 py-3 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={closeMenu}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {settingsOpen ? (
            <div className="site-menu-settings-overlay absolute inset-0 z-10 flex flex-col">
              <button
                type="button"
                className="absolute inset-0 bg-black/20 dark:bg-black/40"
                aria-label="Cerrar ajustes"
                onClick={closeSettings}
              />
              <div className="relative z-10 flex h-full min-h-0 flex-col shadow-xl">
                <MenuSettingsPanel
                  theme={theme}
                  fontFamilyId={fontFamilyId}
                  baseFontSize={baseFontSize}
                  onToggleTheme={onToggleTheme}
                  onIncreaseFont={onIncreaseFont}
                  onDecreaseFont={onDecreaseFont}
                  onSelectFont={onSelectFont}
                  onClose={closeSettings}
                />
              </div>
            </div>
          ) : null}
        </div>
      </>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="theme-toolbar-btn shrink-0 px-3"
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        title="Menú"
      >
        <HamburgerIcon />
      </button>

      {mounted && menuLayer ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
