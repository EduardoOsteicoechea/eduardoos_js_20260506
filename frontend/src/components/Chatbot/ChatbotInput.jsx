import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { SiteControlButton } from '../ui';
import {
  CloseTrayIcon,
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
  inputPlaceholder,
  sendLabel,
  onCloseTray,
  closeTrayLabel = 'Close',
  disabled,
}) {
  return (
    <div className="chatbot-input theme-border">
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
        className={`${UI_FIELD_CLASS} chatbot-input__field`}
        aria-label="Message for assistant"
      />

      <div className="chatbot-input__toolbar">
        <div className="chatbot-input__toolbar-start">
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

        <div className="chatbot-input__toolbar-end">
          <SiteControlButton
            size="md"
            variant="close"
            onClick={onCloseTray}
            icon={<CloseTrayIcon />}
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
            className="ui-control--icon-label chatbot-input__send"
            title={sendLabel}
            aria-label={sendLabel}
          />
        </div>
      </div>
    </div>
  );
}
