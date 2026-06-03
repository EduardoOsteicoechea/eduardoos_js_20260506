import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getChatbotTrayWidthPx,
  setChatbotTrayWidthPx,
  subscribeChatbotTrayWidth,
} from '../../lib/chatbotTrayWidthStore';
import { CHATBOT_TRAY_MAX_VW, CHATBOT_TRAY_MIN_WIDTH_PX } from '../../config/chatbotTrayRoutes';

function canResizeTray() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 768px)').matches;
}

/**
 * Horizontal resize for the chat tray (left edge), up to 90vw on tablet/desktop.
 */
export function useChatbotTrayResize({ enabled = true } = {}) {
  const [widthPx, setWidthPx] = useState(() =>
    typeof window !== 'undefined' ? getChatbotTrayWidthPx() : 352,
  );
  const [resizable, setResizable] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const syncWidth = () => setWidthPx(getChatbotTrayWidthPx());
    syncWidth();
    return subscribeChatbotTrayWidth(syncWidth);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setResizable(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [enabled]);

  const onResizePointerDown = useCallback(
    (event) => {
      if (!canResizeTray()) return;
      event.preventDefault();
      draggingRef.current = true;

      const startX = event.clientX;
      const startWidth = getChatbotTrayWidthPx();

      const onMove = (moveEvent) => {
        if (!draggingRef.current) return;
        const delta = startX - moveEvent.clientX;
        const next = startWidth + delta;
        setChatbotTrayWidthPx(next, { persist: false });
        setWidthPx(getChatbotTrayWidthPx());
      };

      const onUp = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setChatbotTrayWidthPx(getChatbotTrayWidthPx(), { persist: true });
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [],
  );

  const maxWidthPx =
    typeof window !== 'undefined'
      ? Math.round((window.innerWidth * CHATBOT_TRAY_MAX_VW) / 100)
      : undefined;

  return {
    widthPx,
    resizable: enabled && resizable,
    onResizePointerDown,
    minWidthPx: CHATBOT_TRAY_MIN_WIDTH_PX,
    maxWidthPx,
  };
}
