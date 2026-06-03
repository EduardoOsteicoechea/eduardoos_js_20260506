import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { SiteControlButton } from '../ui';
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
 *   onCloseTray: () => void,
 *   closeTrayLabel?: string,
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
  onCloseTray,
  closeTrayLabel = 'Close',
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
        placeholder={inputPlaceholder}
        className={`${UI_FIELD_CLASS} text-sm`}
        aria-label="Message for assistant"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <SiteControlButton
            size="md"
            disabled={disabled}
            onClick={onCycleLanguage}
            title={`Language: ${languageLabel} (click to switch)`}
            aria-label={`Reply language: ${languageLabel}. Click to switch.`}
            icon={
              <span className="relative inline-flex">
                <LanguageIcon />
                <span className="absolute -bottom-1 -right-1 rounded bg-black px-0.5 text-[8px] font-bold leading-none text-white dark:bg-white dark:text-black">
                  {languageCode}
                </span>
              </span>
            }
          />

          <SiteControlButton
            size="md"
            disabled={disabled}
            onClick={onSuggest}
            title="Suggest question"
            aria-label="Suggest question"
            icon={<SuggestIcon />}
          />

          <SiteControlButton
            size="md"
            disabled={disabled}
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
            icon={<NewChatIcon />}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-black/10 pl-2 dark:border-white/10">
          <SiteControlButton
            size="md"
            variant="close"
            onClick={onCloseTray}
            label="›"
            className="text-lg font-bold leading-none"
            aria-label={closeTrayLabel}
            title={closeTrayLabel}
          />

          <SiteControlButton
            size="md"
            variant="success"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            icon={<SendIcon />}
            label={sendLabel}
            className="ui-control--icon-label text-xs"
            title={sendLabel}
            aria-label={sendLabel}
          />
        </div>
      </div>
    </div>
  );
}
