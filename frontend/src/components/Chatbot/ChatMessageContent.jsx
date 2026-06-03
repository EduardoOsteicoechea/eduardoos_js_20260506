import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

/**
 * @param {{ content: string }} props
 */
export default function ChatMessageContent({ content }) {
  return (
    <div className="chatbot-message-content">
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className="chatbot-md-p">{children}</p>,
          ul: ({ children }) => <ul className="chatbot-md-ul">{children}</ul>,
          ol: ({ children }) => <ol className="chatbot-md-ol">{children}</ol>,
          li: ({ children }) => <li className="chatbot-md-li">{children}</li>,
          strong: ({ children }) => (
            <strong className="chatbot-md-strong">{children}</strong>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
