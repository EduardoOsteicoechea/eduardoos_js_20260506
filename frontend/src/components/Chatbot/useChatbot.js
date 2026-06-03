import { useSyncExternalStore } from 'react';
import { getChatLanguageConfig } from '../../lib/chatbot/chatLanguage';
import {
  closeChatbotTray,
  cycleChatbotLanguage,
  getChatbotGlobalContext,
  getChatbotPageContext,
  getChatbotPathname,
  getChatbotPreferredLanguage,
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
    preferredLanguage: getChatbotPreferredLanguage(),
    languageConfig: getChatLanguageConfig(getChatbotPreferredLanguage()),
    cycleLanguage: cycleChatbotLanguage,
    refreshPageContext: refreshChatbotPageContext,
    pathname: getChatbotPathname(),
  };
}
