import {
  LanguageIcon,
  NewChatIcon,
  SendIcon,
  SuggestIcon,
} from './ChatbotActionIcons';

/**
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   onSend: () => void,
 *   onNewChat: () => void,
 *   onSuggest: () => void,
 *   onCycleLanguage: () => void,
 *   languageLabel: string,
 *   languageCode: string,
 *   inputPlaceholder: string,
 *   sendLabel: string,
 *   disabled?: boolean,
 * }} props
 */
export default function ChatbotInput({
  value,
  onChange,
  onSend,
  onNewChat,
  onSuggest,
  onCycleLanguage,
  languageLabel,
  languageCode,
  inputPlaceholder,
  sendLabel,
  disabled,
}) {
  const iconBtn =
    'theme-toolbar-btn flex h-8 w-8 shrink-0 items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50';

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
        placeholder={inputPlaceholder}
        className="theme-border w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        aria-label="Message for assistant"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCycleLanguage}
            disabled={disabled}
            className={iconBtn}
            title={`Language: ${languageLabel} (click to switch)`}
            aria-label={`Reply language: ${languageLabel}. Click to switch.`}
          >
            <span className="relative inline-flex">
              <LanguageIcon />
              <span className="absolute -bottom-1 -right-1 rounded bg-black px-0.5 text-[8px] font-bold leading-none text-white dark:bg-white dark:text-black">
                {languageCode}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onSuggest}
            disabled={disabled}
            className={iconBtn}
            title="Suggest question"
            aria-label="Suggest question"
          >
            <SuggestIcon />
          </button>

          <button
            type="button"
            onClick={onNewChat}
            disabled={disabled}
            className={iconBtn}
            title="New chat"
            aria-label="New chat"
          >
            <NewChatIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="theme-toolbar-btn flex h-8 shrink-0 items-center gap-1.5 border-green-500/60 bg-green-500/15 px-2.5 text-xs font-semibold text-green-700 hover:bg-green-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-300"
          title={sendLabel}
          aria-label={sendLabel}
        >
          <SendIcon />
          <span>{sendLabel}</span>
        </button>
      </div>
    </div>
  );
}
