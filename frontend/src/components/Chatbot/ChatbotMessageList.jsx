import { formatMessageTime } from '../../lib/chatbot/formatMessageTime';
import { navigateTo } from '../../lib/chatbot/navigate';

/**
 * @typedef {{ type: 'navigate', path: string, label?: string }} ChatMessageAction
 * @typedef {{ id: string, role: 'user' | 'assistant' | 'system', content: string, createdAt: string, highlightGlow?: boolean, actions?: ChatMessageAction[] }} ChatMessage
 */

/**
 * @param {{ messages: ChatMessage[], preferredLanguage?: 'en' | 'es' }} props
 */
export default function ChatbotMessageList({ messages, preferredLanguage = 'en' }) {
  if (!messages.length) {
    const hint =
      preferredLanguage === 'es'
        ? 'Pregunta sobre esta página o el sitio. El idioma de respuesta lo eliges con el botón del globo.'
        : 'Ask about this page or the site. Pick reply language with the globe button.';
    return (
      <div className="theme-muted flex flex-1 items-center justify-center px-4 text-center text-sm">
        {hint}
      </div>
    );
  }

  return (
    <ul className="flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-3">
      {messages.map((message) => {
        const assistantBase =
          'mr-4 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-black/40';

        return (
        <li
          key={message.id}
          className={
            message.role === 'user'
              ? 'ml-6 rounded-lg border border-black/15 bg-black/[0.04] px-3 py-2 text-sm dark:border-white/15 dark:bg-white/[0.06]'
              : message.role === 'system'
                ? 'theme-muted text-center text-xs italic'
                : message.highlightGlow
                  ? `${assistantBase} chatbot-message-glow`
                  : assistantBase
          }
        >
          <time
            dateTime={message.createdAt}
            className="theme-muted mb-1 block text-[10px] font-medium tabular-nums"
          >
            {formatMessageTime(message.createdAt, preferredLanguage)}
          </time>
          <span className="whitespace-pre-wrap">{message.content}</span>
          {message.actions?.map((action) =>
            action.type === 'navigate' ? (
              <button
                key={`${message.id}-${action.path}`}
                type="button"
                className="theme-toolbar-btn mt-2 w-full justify-center text-xs font-semibold"
                onClick={() => navigateTo(action.path)}
              >
                Ir a {action.label || action.path}
              </button>
            ) : null,
          )}
        </li>
        );
      })}
    </ul>
  );
}
