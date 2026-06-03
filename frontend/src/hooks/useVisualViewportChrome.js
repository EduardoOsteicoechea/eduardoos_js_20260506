import { useEffect } from 'react';

function syncVisualViewportVars() {
  const root = document.documentElement;
  const vv = window.visualViewport;

  if (!vv) {
    root.style.removeProperty('--vv-height');
    root.style.removeProperty('--vv-offset-top');
    root.style.removeProperty('--vv-offset-left');
    root.style.removeProperty('--vv-width');
    root.style.removeProperty('--vv-bottom-inset');
    return;
  }

  const bottomInset = Math.max(
    0,
    window.innerHeight - vv.height - vv.offsetTop,
  );

  root.style.setProperty('--vv-height', `${vv.height}px`);
  root.style.setProperty('--vv-offset-top', `${vv.offsetTop}px`);
  root.style.setProperty('--vv-offset-left', `${vv.offsetLeft}px`);
  root.style.setProperty('--vv-width', `${vv.width}px`);
  root.style.setProperty('--vv-bottom-inset', `${bottomInset}px`);
}

/**
 * Syncs CSS variables to window.visualViewport so fixed chrome (activity bar)
 * stays aligned with the visible screen when mobile browser UI shows/hides.
 */
export function useVisualViewportChrome() {
  useEffect(() => {
    let frame = 0;

    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncVisualViewportVars);
    };

    scheduleSync();
    window.visualViewport?.addEventListener('resize', scheduleSync);
    window.visualViewport?.addEventListener('scroll', scheduleSync);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('orientationchange', scheduleSync);

    return () => {
      cancelAnimationFrame(frame);
      window.visualViewport?.removeEventListener('resize', scheduleSync);
      window.visualViewport?.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('orientationchange', scheduleSync);
    };
  }, []);
}
