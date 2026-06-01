import { getSectionId } from './sectionIds';

export default function CollapsibleSection({
  number,
  heading,
  isExpanded,
  onToggle,
  children,
}) {
  return (
    <section
      id={getSectionId(number)}
      className="theme-border article-section scroll-mt-6 border-b last:border-b-0"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`article-section-toggle flex w-full items-start justify-between gap-3 px-4 py-5 text-left ${
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
      </button>

      {isExpanded ? (
        <div className="article-section-content px-4 pb-10 pt-2">{children}</div>
      ) : null}
    </section>
  );
}
