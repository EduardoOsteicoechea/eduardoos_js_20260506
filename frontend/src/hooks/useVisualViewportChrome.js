import { useEffect } from 'react';

/**
 * Syncs CSS variables to window.visualViewport so fixed chrome (activity bar)
 * stays aligned with the visible screen when mobile browser UI shows/hides.
 */
export function useVisualViewportChrome() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const vv = window.visualViewport;

      if (!vv) {
        root.style.removeProperty('--vv-height');
        root.style.removeProperty('--vv-offset-top');
        root.style.removeProperty('--vv-offset-left');
        root.style.removeProperty('--vv-width');
        return;
      }

      root.style.setProperty('--vv-height', `${vv.height}px`);
      root.style.setProperty('--vv-offset-top', `${vv.offsetTop}px`);
      root.style.setProperty('--vv-offset-left', `${vv.offsetLeft}px`);
      root.style.setProperty('--vv-width', `${vv.width}px`);
    };

    sync();
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);

    return () => {
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);
}
