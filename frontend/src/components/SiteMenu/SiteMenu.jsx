import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { PUBLIC_NAV_LINKS } from '../../lib/siteNav';
import { getSiteLabel } from '../../lib/siteLanguage';
import MenuSettingsPanel from './MenuSettingsPanel';
import { SiteControlButton } from '../ui';
import { HamburgerIcon, SettingsIcon } from './MenuIcons';

function lockBodyScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '';
}

function unlockBodyScroll() {
  document.documentElement.style.overflow = '';
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
  const lang = useSiteLanguage();

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

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => {
      if (open) setSettingsOpen(false);
      return !open;
    });
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
          className="site-menu-backdrop fixed inset-x-0 top-0 bottom-[var(--activity-bar-height)] z-[200] bg-black/40"
          aria-label={getSiteLabel('closeMenu', lang)}
          onClick={closeMenu}
        />

        <div
          id="site-menu-drawer"
          className="site-menu-drawer fixed top-0 right-0 bottom-[var(--activity-bar-height)] z-[210] flex w-[min(100vw,20rem)] flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={getSiteLabel('menu', lang)}
        >
          <aside className="theme-border theme-surface site-menu-tray relative flex h-full min-h-0 flex-1 flex-col overflow-hidden border-l shadow-xl">
            <header className="theme-border flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
              <h2 className="text-sm font-bold tracking-wide">
                {getSiteLabel('menu', lang)}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSettings}
                  className={`theme-toolbar-btn h-8 w-8 p-0 ${
                    settingsOpen ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  aria-label={getSiteLabel('settings', lang)}
                  aria-expanded={settingsOpen}
                  title={getSiteLabel('settings', lang)}
                >
                  <SettingsIcon />
                </button>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="theme-toolbar-btn h-8 w-8 border-red-500/60 bg-red-500/10 p-0 text-2xl font-bold leading-none text-red-600 hover:bg-red-500/20 dark:text-red-400"
                  aria-label={getSiteLabel('closeMenu', lang)}
                  title={getSiteLabel('closeMenu', lang)}
                >
                  ×
                </button>
              </div>
            </header>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Navigation">
              <ul className="space-y-1">
                {PUBLIC_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="theme-border block rounded-lg border px-4 py-3 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={closeMenu}
                    >
                      {getSiteLabel(link.labelKey, lang)}
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
      <SiteControlButton
        size="bar"
        variant="default"
        active={menuOpen}
        onClick={toggleMenu}
        icon={<HamburgerIcon />}
        iconClassName="ui-control__icon--compact"
        className="site-menu-toggle relative z-[230]"
        aria-label={
          menuOpen ? getSiteLabel('closeMenu', lang) : getSiteLabel('openMenu', lang)
        }
        aria-expanded={menuOpen}
        aria-controls="site-menu-drawer"
        aria-haspopup="dialog"
        title={getSiteLabel('menu', lang)}
      />

      {mounted && menuLayer ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
