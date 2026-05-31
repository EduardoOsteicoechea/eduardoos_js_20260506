export default function CollapsibleSection({
  number,
  heading,
  isExpanded,
  onToggle,
  children,
}) {
  const contentId = `article-section-content-${number}`;

  return (
    <details
      open={isExpanded}
      className="theme-border article-section group border-b last:border-b-0"
    >
      <summary
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className={`article-section-toggle flex w-full cursor-pointer list-none items-start justify-between gap-3 px-4 py-5 text-left marker:content-none ${
          isExpanded ? 'article-section-toggle--active' : ''
        }`}
      >
        <span className="text-[1.35em] font-semibold leading-snug">
          {number}. {heading}
        </span>
        <span
          className="theme-muted mt-1 shrink-0 text-xl leading-none"
          aria-hidden="true"
        >
          {isExpanded ? '−' : '+'}
        </span>
      </summary>

      <div id={contentId} className="article-section-content px-4 pb-8 pt-10">
        {children}
      </div>
    </details>
  );
}
