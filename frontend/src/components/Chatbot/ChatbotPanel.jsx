import { useCallback, useState } from 'react';
import { sendChatbotMessage } from '../../lib/chatbot/chatbotApi';
import ChatbotContextBar from './ChatbotContextBar';
import ChatbotInput from './ChatbotInput';
import ChatbotMessageList from './ChatbotMessageList';
import { useChatbot } from './useChatbot';

function buildStubReply(pageType, userText) {
  return `Recibí tu mensaje sobre "${userText.slice(0, 80)}${userText.length > 80 ? '…' : ''}". El servicio chatbot respondió en modo local. Contexto de página: ${pageType}.`;
}

function buildSuggestion(pageContext) {
  if (pageContext.pageType === 'home' && pageContext.skillLabels?.length) {
    return `¿Cómo encajan habilidades como ${pageContext.skillLabels.slice(0, 3).join(', ')} en tu perfil profesional?`;
  }
  if (pageContext.heading) {
    return `Resume los puntos clave de "${pageContext.heading}" en este sitio.`;
  }
  return '¿Qué servicios ofreces y cómo puedo contactarte para un proyecto BIM?';
}

export default function ChatbotPanel() {
  const { pageContext, globalContext, closeTray } = useChatbot();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(
    /** @type {import('./ChatbotMessageList').ChatMessage[]} */ ([]),
  );
  const [busy, setBusy] = useState(false);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setDraft('');
    setMessages((prev) => [...prev, userMessage]);
    setBusy(true);

    const history = [...messages, userMessage]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const replyText = await sendChatbotMessage({
        message: text,
        pageContext,
        globalContext,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: replyText,
        },
      ]);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : buildStubReply(pageContext.pageType, text);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fallback,
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
    setDraft(buildSuggestion(pageContext));
  }, [pageContext]);

  return (
    <div className="chatbot-panel theme-surface flex h-full min-h-0 flex-col">
      <header className="theme-border flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold">Asistente AI</h2>
          <p className="theme-muted truncate text-xs">{pageContext.pathname}</p>
        </div>
        <button
          type="button"
          onClick={closeTray}
          className="theme-toolbar-btn h-8 w-8 shrink-0 p-0 text-lg leading-none"
          aria-label="Cerrar panel"
          title="Cerrar"
        >
          ›
        </button>
      </header>

      <ChatbotContextBar />
      <ChatbotMessageList messages={messages} />
      <ChatbotInput
        value={draft}
        onChange={setDraft}
        onSend={sendMessage}
        onNewChat={handleNewChat}
        onSuggest={handleSuggest}
        disabled={busy}
      />
    </div>
  );
}
