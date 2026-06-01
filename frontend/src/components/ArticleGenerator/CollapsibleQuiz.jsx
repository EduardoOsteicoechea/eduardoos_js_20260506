import { useState } from 'react';

export default function CollapsibleQuiz({
  title,
  questionCount = 0,
  defaultExpanded = false,
  children,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="theme-border mt-10 border-t pt-6">
      <button
        type="button"
        onClick={() => setIsExpanded((open) => !open)}
        aria-expanded={isExpanded}
        className={`article-section-toggle flex w-full items-center justify-between gap-3 px-4 py-5 text-left ${
          isExpanded ? 'article-section-toggle--active' : ''
        }`}
      >
        <span>
          <span className="block text-[1.15em] font-semibold leading-snug">{title}</span>
          {questionCount > 0 ? (
            <span className="theme-muted mt-1 block text-sm">
              {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
            </span>
          ) : null}
        </span>
        <span
          className="theme-muted shrink-0 text-xl leading-none"
          aria-hidden="true"
        >
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded ? <div className="px-4 pb-6 pt-2">{children}</div> : null}
    </div>
  );
}
