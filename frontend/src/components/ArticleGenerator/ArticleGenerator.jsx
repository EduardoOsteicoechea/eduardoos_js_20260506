import MainHeading from './MainHeading';
import SectionHeading from './SectionHeading';
import ArticleMeta from './ArticleMeta';
import ContentBlock from './ContentBlock';
import Quiz from './Quiz';

/**
 * Decoupled article renderer: consumes article JSON and composes UI from
 * dedicated ArticleGenerator components.
 */
export default function ArticleGenerator({ article, slug }) {
  if (!article) return null;

  const serie = article.serie ?? article.series;

  return (
    <article className="article-generator">
      <ArticleMeta
        serie={serie}
        chapter={article.chapter}
        creator={article.creator}
        slug={slug}
      />

      <MainHeading subtitle={serie ? `Serie ${serie}` : undefined}>
        {article.title}
      </MainHeading>

      {article.sections.map((section, sectionIndex) => (
        <section key={`${sectionIndex}-${section.heading}`} className="article-section">
          <SectionHeading>{section.heading}</SectionHeading>

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
        </section>
      ))}

      {article.quiz?.length ? (
        <Quiz items={article.quiz} title="Evaluación del estudio" />
      ) : null}
    </article>
  );
}
