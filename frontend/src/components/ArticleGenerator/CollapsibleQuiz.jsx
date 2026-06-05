import { useState } from 'react';

export default function CollapsibleQuiz({
  title,
  questionCount = 0,
  defaultExpanded = false,
  children,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="collapsible-quiz theme-border">
      <button
        type="button"
        onClick={() => setIsExpanded((open) => !open)}
        aria-expanded={isExpanded}
        className={`collapsible-quiz__toggle article-section-toggle ${
          isExpanded ? 'article-section-toggle--active' : ''
        }`}
      >
        <span>
          <span className="collapsible-quiz__title">{title}</span>
          {questionCount > 0 ? (
            <span className="collapsible-quiz__meta theme-muted">
              {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
            </span>
          ) : null}
        </span>
        <span className="collapsible-quiz__icon theme-muted" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded ? <div className="collapsible-quiz__body">{children}</div> : null}
    </div>
  );
}
