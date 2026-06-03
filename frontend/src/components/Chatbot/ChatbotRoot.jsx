import { useEffect } from 'react';
import {
  initChatbotStore,
  setChatbotPathname,
} from '../../lib/chatbot/chatbotStore';
import ChatbotTray from './ChatbotTray';

/** @deprecated Prefer SiteChromeShell; kept for pages that mount chat without the global bar. */
export default function ChatbotRoot({ pathname }) {
  useEffect(() => {
    initChatbotStore(pathname);
  }, []);

  useEffect(() => {
    setChatbotPathname(pathname);
  }, [pathname]);

  return <ChatbotTray />;
}
