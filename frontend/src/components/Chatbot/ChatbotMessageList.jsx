import { navigateTo } from '../../lib/chatbot/navigate';

/**
 * @typedef {{ type: 'navigate', path: string, label?: string }} ChatMessageAction
 * @typedef {{ id: string, role: 'user' | 'assistant' | 'system', content: string, actions?: ChatMessageAction[] }} ChatMessage
 */

/**
 * @param {{ messages: ChatMessage[] }} props
 */
export default function ChatbotMessageList({ messages }) {
  if (!messages.length) {
    return (
      <div className="theme-muted flex flex-1 items-center justify-center px-4 text-center text-sm">
        Pregunta sobre esta página o el sitio. El contexto de la página se envía
        automáticamente; el contexto global llegará cuando la sesión esté activa.
      </div>
    );
  }

  return (
    <ul className="flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-3">
      {messages.map((message) => (
        <li
          key={message.id}
          className={
            message.role === 'user'
              ? 'ml-6 rounded-lg border border-black/15 bg-black/[0.04] px-3 py-2 text-sm dark:border-white/15 dark:bg-white/[0.06]'
              : message.role === 'system'
                ? 'theme-muted text-center text-xs italic'
                : 'mr-4 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-black/40'
          }
        >
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
      ))}
    </ul>
  );
}
