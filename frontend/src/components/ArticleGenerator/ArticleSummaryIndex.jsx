import { getSectionId } from './sectionIds';

export default function ArticleSummaryIndex({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <nav aria-label="Índice del artículo" className="article-summary theme-border">
      <h2 className="article-summary__title">
        Índice
      </h2>
      <ol className="article-summary__list">
        {sections.map((section, index) => {
          const number = index + 1;

          return (
            <li key={`${index}-${section.heading}`}>
              <a href={`#${getSectionId(number)}`} className="article-summary__link">
                {number}. {section.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
