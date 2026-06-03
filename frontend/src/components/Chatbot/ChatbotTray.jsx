import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import ChatbotPanel from './ChatbotPanel';
import { useChatbot } from './useChatbot';
import { useChatbotTrayResize } from './useChatbotTrayResize';

/**
 * @param {{ inline?: boolean }} props — inline: render inside SiteChromeShell (recommended)
 */
export default function ChatbotTray({ inline = false }) {
  const { open } = useChatbot();
  const [mounted, setMounted] = useState(false);
  const { widthPx, resizable, onResizePointerDown } = useChatbotTrayResize();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tray = (
    <aside
      className={`chatbot-tray theme-border theme-surface absolute right-0 top-0 z-[10] flex flex-col border-l shadow-2xl transition-[transform,visibility,box-shadow] duration-300 ease-out ${
        open ? 'chatbot-tray--open' : 'chatbot-tray--closed pointer-events-none'
      } ${resizable ? 'chatbot-tray--resizable' : ''}`}
      style={{ width: resizable ? `${widthPx}px` : undefined }}
      aria-hidden={!open}
      aria-label="Asistente AI"
    >
      {resizable ? (
        <div
          className="chatbot-tray__resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar panel del asistente"
          onPointerDown={onResizePointerDown}
        />
      ) : null}
      <ChatbotPanel />
    </aside>
  );

  if (inline) return tray;

  return createPortal(tray, document.body);
}
