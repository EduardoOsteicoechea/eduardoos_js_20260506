import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { sendChatbotMessage } from '../../lib/chatbot/chatbotApi';
import {
  getChatbotRevision,
  pullPendingHomeIntroLang,
  subscribeChatbot,
} from '../../lib/chatbot/chatbotStore';
import { getHomeIntroMessage } from '../../lib/chatbot/homeIntroMessage';
import { isNavigationIntent, navigateTo } from '../../lib/chatbot/navigate';
import ChatbotContextBar from './ChatbotContextBar';
import ChatbotInput from './ChatbotInput';
import ChatbotMessageList from './ChatbotMessageList';
import { getSiteLabel } from '../../lib/siteLanguage';
import { useChatbot } from './useChatbot';

function messageTimestamp() {
  return new Date().toISOString();
}

function buildStubReply(pageType, userText) {
  return `Recibí tu mensaje sobre "${userText.slice(0, 80)}${userText.length > 80 ? '…' : ''}". El servicio chatbot respondió en modo local. Contexto de página: ${pageType}.`;
}

/** @param {import('../../lib/chatbot/pageContextSchema').PageContextPayload} pageContext */
/** @param {import('../../lib/chatbot/chatLanguage').ChatLanguageId} lang */
function buildSuggestion(pageContext, lang) {
  const skills = pageContext.skillLabels?.slice(0, 3).join(', ');
  if (pageContext.pageType === 'home' && skills) {
    return lang === 'es'
      ? `¿Cómo encajan habilidades como ${skills} en tu perfil profesional?`
      : `How do skills like ${skills} fit into your professional profile?`;
  }
  if (pageContext.heading) {
    return lang === 'es'
      ? `Resume los puntos clave de "${pageContext.heading}" en este sitio.`
      : `Summarize the key points of "${pageContext.heading}" on this site.`;
  }
  return lang === 'es'
    ? '¿Qué servicios ofreces y cómo puedo contactarte para un proyecto BIM?'
    : 'What services do you offer and how can I contact you for a BIM project?';
}

export default function ChatbotPanel() {
  const {
    pageContext,
    globalContext,
    closeTray,
    languageConfig,
  } = useChatbot();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(
    /** @type {import('./ChatbotMessageList').ChatMessage[]} */ ([]),
  );
  const [busy, setBusy] = useState(false);

  const chatbotRevision = useSyncExternalStore(
    subscribeChatbot,
    getChatbotRevision,
    () => 0,
  );

  useEffect(() => {
    const introLang = pullPendingHomeIntroLang();
    if (!introLang) return;

    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getHomeIntroMessage(introLang),
        createdAt: messageTimestamp(),
        highlightGlow: true,
      },
    ]);
    setDraft('');
  }, [chatbotRevision]);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: messageTimestamp(),
    };

    setDraft('');
    setMessages((prev) => [...prev, userMessage]);
    setBusy(true);

    const history = [...messages, userMessage]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const { reply: replyText, actions } = await sendChatbotMessage({
        message: text,
        pageContext,
        globalContext,
        history,
      });

      const navigateAction = actions.find((a) => a.type === 'navigate');

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: replyText,
          createdAt: messageTimestamp(),
          actions: navigateAction ? [navigateAction] : undefined,
        },
      ]);

      if (navigateAction && isNavigationIntent(text)) {
        navigateTo(navigateAction.path);
      }
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : buildStubReply(pageContext.pageType, text);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fallback,
          createdAt: messageTimestamp(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, draft, globalContext, messages, pageContext]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setDraft('');
  }, []);

  const handleSuggest = useCallback(() => {
    setDraft(buildSuggestion(pageContext, languageConfig.id));
  }, [languageConfig.id, pageContext]);

  return (
    <div className="chatbot-panel theme-surface">
      <ChatbotContextBar />
      <ChatbotMessageList
        messages={messages}
        preferredLanguage={languageConfig.id}
      />
      <ChatbotInput
        value={draft}
        onChange={setDraft}
        onSend={sendMessage}
        onNewChat={handleNewChat}
        onSuggest={handleSuggest}
        onCloseTray={closeTray}
        closeTrayLabel={getSiteLabel('closePanel', languageConfig.id)}
        inputPlaceholder={languageConfig.inputPlaceholder}
        sendLabel={languageConfig.sendLabel}
        disabled={busy}
      />
    </div>
  );
}
