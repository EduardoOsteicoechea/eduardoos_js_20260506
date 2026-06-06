import type { ArticleEntry, SeriesHubData, SeriesHubPostLink } from './types';

export function getHubPostLinks(
  hubSlug: string,
  hub: SeriesHubData,
  articles: ArticleEntry[],
): SeriesHubPostLink[] {
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));
  const prefix = `${hubSlug}/`;
  const listedNames = new Set((hub.posts ?? []).map((post) => post.name));

  const fromHub = (hub.posts ?? []).map((post) => {
    const postSlug = `${hubSlug}/${post.name}`;
    const article = articleBySlug.get(postSlug);

    return {
      ...post,
      slug: postSlug,
      href: article ? `/series/${postSlug}` : undefined,
      available: Boolean(article),
      articleTitle: article?.data.title,
    };
  });

  const fromArticles = articles
    .filter((article) => article.slug.startsWith(prefix))
    .map((article) => {
      const name = article.slug.slice(prefix.length);
      return { article, name };
    })
    .filter(({ name }) => name && !name.includes('/') && !listedNames.has(name))
    .map(({ article, name }) => ({
      name,
      contribution: article.data.title ?? name,
      abstract: '',
      slug: article.slug,
      href: `/series/${article.slug}`,
      available: true,
      articleTitle: article.data.title,
    }));

  return [...fromHub, ...fromArticles];
}
