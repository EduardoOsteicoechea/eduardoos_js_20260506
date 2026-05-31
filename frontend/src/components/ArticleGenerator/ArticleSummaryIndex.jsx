import { getSectionId } from './sectionIds';

export default function ArticleSummaryIndex({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <nav
      aria-label="Índice del artículo"
      className="theme-border mb-10 rounded-lg border p-5"
    >
      <h2 className="mb-4 text-[1.1em] font-semibold uppercase tracking-wide opacity-70">
        Índice
      </h2>
      <ol className="space-y-2">
        {sections.map((section, index) => {
          const number = index + 1;

          return (
            <li key={`${index}-${section.heading}`}>
              <a
                href={`#${getSectionId(number)}`}
                className="leading-snug underline opacity-90 hover:opacity-100"
              >
                {number}. {section.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
