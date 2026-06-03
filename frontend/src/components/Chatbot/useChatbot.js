import { useSyncExternalStore } from 'react';
import {
  closeChatbotTray,
  getChatbotGlobalContext,
  getChatbotPageContext,
  getChatbotPathname,
  getChatbotRevision,
  getChatbotTrayOpen,
  openChatbotTray,
  refreshChatbotPageContext,
  subscribeChatbot,
  toggleChatbotTray,
} from '../../lib/chatbot/chatbotStore';

export function useChatbot() {
  useSyncExternalStore(subscribeChatbot, getChatbotRevision, () => 0);

  return {
    open: getChatbotTrayOpen(),
    openTray: openChatbotTray,
    closeTray: closeChatbotTray,
    toggleTray: toggleChatbotTray,
    pageContext: getChatbotPageContext(),
    globalContext: getChatbotGlobalContext(),
    refreshPageContext: refreshChatbotPageContext,
    pathname: getChatbotPathname(),
  };
}
