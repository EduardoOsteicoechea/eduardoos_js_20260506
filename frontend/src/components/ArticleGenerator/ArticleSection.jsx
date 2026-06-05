import { getSectionId } from './sectionIds';

export default function ArticleSection({ number, heading, children }) {
  return (
    <section
      id={getSectionId(number)}
      className="article-section theme-border"
    >
      <h2 className="article-section-heading">
        {number}. {heading}
      </h2>
      <div className="article-section-content">{children}</div>
    </section>
  );
}
