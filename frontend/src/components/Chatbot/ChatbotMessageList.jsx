import { formatMessageTime } from '../../lib/chatbot/formatMessageTime';
import { navigateTo } from '../../lib/chatbot/navigate';
import ChatMessageContent from './ChatMessageContent';

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
      <div className="chatbot-messages__empty theme-muted">
        {hint}
      </div>
    );
  }

  return (
    <ul className="chatbot-messages">
      {messages.map((message) => {
        const roleClass =
          message.role === 'user'
            ? 'chatbot-message--user'
            : message.role === 'system'
              ? 'chatbot-message--system theme-muted'
              : 'chatbot-message--assistant';

        const glowClass =
          message.role === 'assistant' && message.highlightGlow
            ? ' chatbot-message-glow'
            : '';

        return (
          <li
            key={message.id}
            className={`chatbot-message ${roleClass}${glowClass}`}
          >
            <time
              dateTime={message.createdAt}
              className="chatbot-message__time theme-muted"
            >
              {formatMessageTime(message.createdAt, preferredLanguage)}
            </time>
            {message.role === 'assistant' ? (
              <ChatMessageContent content={message.content} />
            ) : (
              <span className="chatbot-message__text">{message.content}</span>
            )}
            {message.actions?.map((action) =>
              action.type === 'navigate' ? (
                <button
                  key={`${message.id}-${action.path}`}
                  type="button"
                  className="theme-toolbar-btn chatbot-message__nav-btn"
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
