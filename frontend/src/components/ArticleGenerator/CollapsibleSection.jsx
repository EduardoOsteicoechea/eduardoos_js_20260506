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
      className="article-section theme-border"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`article-section-toggle ${
          isExpanded ? 'article-section-toggle--active' : ''
        }`}
      >
        <span className="article-section-toggle__title">
          {number}. {heading}
        </span>
        <span className="article-section-toggle__icon theme-muted" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded ? (
        <div className="article-section-content">{children}</div>
      ) : null}
    </section>
  );
}
