import { NewChatIcon, SendIcon, SuggestIcon } from './ChatbotActionIcons';

/**
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   onSend: () => void,
 *   onNewChat: () => void,
 *   onSuggest: () => void,
 *   disabled?: boolean,
 * }} props
 */
export default function ChatbotInput({
  value,
  onChange,
  onSend,
  onNewChat,
  onSuggest,
  disabled,
}) {
  return (
    <div className="theme-border shrink-0 border-t p-3">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        disabled={disabled}
        placeholder="Escribe tu mensaje…"
        className="theme-border w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        aria-label="Mensaje para el asistente"
      />

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onSuggest}
          disabled={disabled}
          className="theme-toolbar-btn flex h-8 items-center gap-1.5 px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          title="Sugerir pregunta"
          aria-label="Sugerir pregunta"
        >
          <SuggestIcon />
          <span>Suggest</span>
        </button>

        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          className="theme-toolbar-btn flex h-8 items-center gap-1.5 px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          title="Nuevo chat"
          aria-label="Nuevo chat"
        >
          <NewChatIcon />
          <span>New chat</span>
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="theme-toolbar-btn flex h-8 items-center gap-1.5 border-green-500/60 bg-green-500/15 px-2.5 text-xs font-semibold text-green-700 hover:bg-green-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-300"
          title="Enviar"
          aria-label="Enviar mensaje"
        >
          <SendIcon />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
