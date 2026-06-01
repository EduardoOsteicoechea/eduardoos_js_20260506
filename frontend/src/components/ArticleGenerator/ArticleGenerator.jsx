import MainHeading from './MainHeading';
import ArticleMeta from './ArticleMeta';
import ArticleSummaryIndex from './ArticleSummaryIndex';
import SectionContent from './SectionContent';
import Quiz from './Quiz';
import ArticleSection from './ArticleSection';
import CollapsibleSection from './CollapsibleSection';
import { VIEW_MODES } from '../../lib/viewModes';

/**
 * Decoupled article renderer: consumes article JSON and composes UI from
 * dedicated ArticleGenerator components.
 */
export default function ArticleGenerator({
  article,
  slug,
  baseFontSize = 18,
  viewMode = VIEW_MODES.regular,
  expandedSections,
  onToggleSection,
}) {
  if (!article) return null;

  const serie = article.serie ?? article.series;
  const showQuizzes = viewMode !== VIEW_MODES.outline;
  const isCollapsible = viewMode === VIEW_MODES.collapsible;

  const renderSectionBody = (section, sectionIndex) => (
    <>
      <div className="article-section__content">
        <SectionContent
          content={section.content}
          sectionIndex={sectionIndex}
          viewMode={viewMode}
        />
      </div>

      {showQuizzes && section.quiz?.length ? (
        <Quiz items={section.quiz} title="Preguntas de la sección" />
      ) : null}
    </>
  );

  return (
    <article
      className="article-generator"
      style={{ fontSize: `${baseFontSize}px` }}
    >
      <ArticleMeta
        serie={serie}
        chapter={article.chapter}
        creator={article.creator}
        slug={slug}
      />

      <MainHeading subtitle={serie ? `Serie ${serie}` : undefined}>
        {article.title}
      </MainHeading>

      <ArticleSummaryIndex sections={article.sections} />

      <div className="article-sections">
        {article.sections.map((section, sectionIndex) => {
          const number = sectionIndex + 1;
          const body = renderSectionBody(section, sectionIndex);

          if (isCollapsible) {
            return (
              <CollapsibleSection
                key={`${sectionIndex}-${section.heading}`}
                number={number}
                heading={section.heading}
                isExpanded={expandedSections.has(sectionIndex)}
                onToggle={() => onToggleSection(sectionIndex)}
              >
                {body}
              </CollapsibleSection>
            );
          }

          return (
            <ArticleSection
              key={`${sectionIndex}-${section.heading}`}
              number={number}
              heading={section.heading}
            >
              {body}
            </ArticleSection>
          );
        })}
      </div>

      {showQuizzes && article.quiz?.length ? (
        <Quiz items={article.quiz} title="Evaluación del estudio" />
      ) : null}
    </article>
  );
}
