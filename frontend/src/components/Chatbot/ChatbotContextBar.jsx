import { useChatbot } from './useChatbot';

export default function ChatbotContextBar() {
  const { pageContext, globalContext } = useChatbot();

  return (
    <div className="theme-border shrink-0 space-y-2 border-b px-3 py-2 text-xs">
      <div>
        <p className="theme-muted font-semibold uppercase tracking-wide">
          Page context
        </p>
        <p className="mt-0.5 leading-snug">
          <span className="font-medium">{pageContext.pageType}</span>
          {pageContext.heading ? ` · ${pageContext.heading}` : null}
        </p>
      </div>
      <div>
        <p className="theme-muted font-semibold uppercase tracking-wide">
          Global context
        </p>
        <p className="mt-0.5 leading-snug opacity-80">
          {globalContext.implemented
            ? globalContext.userDisplayName ?? 'Session active'
            : globalContext.statusMessage}
        </p>
        <p className="theme-muted mt-1 leading-snug">
          Reply language:{' '}
          <span className="font-medium text-inherit">
            {globalContext.replyLanguage}
          </span>
        </p>
      </div>
    </div>
  );
}
