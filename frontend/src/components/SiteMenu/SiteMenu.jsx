import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { PUBLIC_NAV_LINKS } from '../../lib/siteNav';
import { getSiteLabel } from '../../lib/siteLanguage';
import MenuSettingsPanel from './MenuSettingsPanel';
import { SiteControlButton } from '../ui';
import { HamburgerIcon, renderNavLinkIcon, SettingsIcon } from './MenuIcons';

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
          className="site-menu-backdrop"
          style={{
            top: 'var(--vv-offset-top, 0)',
            bottom:
              'calc(var(--activity-bar-height) + env(safe-area-inset-bottom, 0px) + var(--vv-bottom-inset, 0px))',
          }}
          aria-label={getSiteLabel('closeMenu', lang)}
          onClick={closeMenu}
        />

        <div
          id="site-menu-drawer"
          className="site-menu-drawer"
          style={{
            top: 'var(--vv-offset-top, 0)',
            height:
              'calc(var(--vv-height, 100dvh) - var(--activity-bar-height) - env(safe-area-inset-bottom, 0px) - var(--vv-bottom-inset, 0px))',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={getSiteLabel('menu', lang)}
        >
          <aside className="theme-border theme-surface site-menu-tray">
            <header className="site-menu-tray__header theme-border">
              <h2 className="site-menu-tray__title">
                {getSiteLabel('menu', lang)}
              </h2>
              <div className="site-menu-tray__header-actions">
                <button
                  type="button"
                  onClick={toggleSettings}
                  className={`theme-toolbar-btn site-menu-tray__icon-btn ${
                    settingsOpen ? 'site-menu-tray__icon-btn--active' : ''
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
                  className="theme-toolbar-btn site-menu-tray__close-btn"
                  aria-label={getSiteLabel('closeMenu', lang)}
                  title={getSiteLabel('closeMenu', lang)}
                >
                  ×
                </button>
              </div>
            </header>

            <nav className="site-menu-tray__nav" aria-label="Navigation">
              <ul className="site-menu-tray__nav-list">
                {PUBLIC_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="site-menu-tray__nav-link theme-border"
                      onClick={closeMenu}
                    >
                      <span className="site-menu-tray__nav-icon theme-border">
                        {renderNavLinkIcon(link.icon)}
                      </span>
                      <span>{getSiteLabel(link.labelKey, lang)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {settingsOpen ? (
            <div className="site-menu-settings-overlay">
              <button
                type="button"
                className="site-menu-settings-overlay__backdrop"
                aria-label="Cerrar ajustes"
                onClick={closeSettings}
              />
              <div className="site-menu-settings-overlay__panel">
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
        variant="framed"
        active={menuOpen}
        onClick={toggleMenu}
        icon={<HamburgerIcon />}
        iconClassName="ui-control__icon--compact"
        className="site-menu-toggle"
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
