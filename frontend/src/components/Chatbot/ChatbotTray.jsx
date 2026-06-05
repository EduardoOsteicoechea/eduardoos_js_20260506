import { useEffect, useState } from 'react';
import ChatbotPanel from './ChatbotPanel';
import { useChatbot } from './useChatbot';
import { useChatbotTrayResize } from './useChatbotTrayResize';

/** AI chat tray — always rendered inside SiteChrome. */
export default function ChatbotTray() {
  const { open } = useChatbot();
  const [mounted, setMounted] = useState(false);
  const { widthPx, resizable, onResizePointerDown } = useChatbotTrayResize();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <aside
      className={[
        'chatbot-tray',
        'theme-border',
        'theme-surface',
        open ? 'chatbot-tray--open' : 'chatbot-tray--closed',
        resizable ? 'chatbot-tray--resizable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
}
