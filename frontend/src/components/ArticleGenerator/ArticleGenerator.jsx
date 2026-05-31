import MainHeading from './MainHeading';
import ArticleMeta from './ArticleMeta';
import ArticleSummaryIndex from './ArticleSummaryIndex';
import ContentBlock from './ContentBlock';
import Quiz from './Quiz';
import ArticleSection from './ArticleSection';

/**
 * Decoupled article renderer: consumes article JSON and composes UI from
 * dedicated ArticleGenerator components.
 */
export default function ArticleGenerator({ article, slug, baseFontSize = 18 }) {
  if (!article) return null;

  const serie = article.serie ?? article.series;

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
        {article.sections.map((section, sectionIndex) => (
          <ArticleSection
            key={`${sectionIndex}-${section.heading}`}
            number={sectionIndex + 1}
            heading={section.heading}
          >
            <div className="article-section__content">
              {section.content?.map((block, blockIndex) => (
                <ContentBlock
                  key={`${sectionIndex}-${blockIndex}`}
                  block={block}
                  index={blockIndex}
                />
              ))}
            </div>

            {section.quiz?.length ? (
              <Quiz items={section.quiz} title="Preguntas de la sección" />
            ) : null}
          </ArticleSection>
        ))}
      </div>

      {article.quiz?.length ? (
        <Quiz items={article.quiz} title="Evaluación del estudio" />
      ) : null}
    </article>
  );
}
