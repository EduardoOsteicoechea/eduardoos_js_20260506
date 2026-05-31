import { getSectionId } from './sectionIds';

export default function ArticleSection({ number, heading, children }) {
  return (
    <section
      id={getSectionId(number)}
      className="theme-border article-section scroll-mt-6 border-b last:border-b-0"
    >
      <h2 className="article-section-heading px-4 py-5 text-[1.35em] font-semibold leading-snug">
        {number}. {heading}
      </h2>

      <div className="article-section-content px-4 pb-10">{children}</div>
    </section>
  );
}
