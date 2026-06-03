import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { CHATBOT_TRAY_WIDTH } from '../../config/chatbotTrayRoutes';
import ChatbotPanel from './ChatbotPanel';
import { useChatbot } from './useChatbot';

export default function ChatbotTray() {
  const { open } = useChatbot();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <aside
      className={`chatbot-tray theme-border theme-surface fixed right-0 top-0 z-[150] flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      }`}
      style={{ width: CHATBOT_TRAY_WIDTH }}
      aria-hidden={!open}
      aria-label="Asistente AI"
    >
      <ChatbotPanel />
    </aside>,
    document.body,
  );
}
