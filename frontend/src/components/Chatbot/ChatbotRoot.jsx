import { useEffect } from 'react';
import {
  initChatbotStore,
  setChatbotPathname,
} from '../../lib/chatbot/chatbotStore';
import ChatbotTray from './ChatbotTray';

/**
 * @param {{ pathname: string }} props
 */
export default function ChatbotRoot({ pathname }) {
  useEffect(() => {
    initChatbotStore(pathname);
  }, []);

  useEffect(() => {
    setChatbotPathname(pathname);
  }, [pathname]);

  return <ChatbotTray />;
}
