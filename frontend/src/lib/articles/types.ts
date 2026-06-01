export interface ListItemBlock {
  text: string;
  emphasized_phrases?: string[];
}

export interface ContentBlock {
  text?: string;
  biblical_reference?: string;
  emphasized_phrases?: string[];
  image?: string;
  alt?: string;
  list?: Array<string | ListItemBlock>;
  ordered?: boolean;
}

export interface QuizItem {
  question: string;
  options: string[];
  correct_option: string[];
  rationale: string[];
}

export interface ArticleSection {
  heading: string;
  content: ContentBlock[];
  quiz?: QuizItem[];
}

export interface ArticleData {
  serie?: string;
  series?: string;
  chapter?: number;
  creator?: string;
  title: string;
  sections: ArticleSection[];
  quiz?: QuizItem[];
}

export interface ArticleEntry {
  slug: string;
  data: ArticleData;
  dataPath: string;
  /** Public URL to sermon.mp3 when present alongside data.json */
  sermonPath?: string;
}

export interface BiblicalTextRef {
  text: string;
  reference: string;
}

export interface SeriesHubPost {
  name: string;
  contribution: string;
  abstract: string;
  biblical_texts?: BiblicalTextRef[];
}

export interface SeriesHubData {
  series?: string;
  section?: string;
  book?: string;
  description?: string;
  purpose?: string;
  biblical_texts?: BiblicalTextRef[];
  posts: SeriesHubPost[];
}

export interface SeriesHubEntry {
  slug: string;
  data: SeriesHubData;
}

export type SeriesChildKind = 'hub' | 'article' | 'folder';

export interface SeriesChildLink {
  slug: string;
  label: string;
  description?: string;
  kind: SeriesChildKind;
}

export interface SeriesHubPostLink extends SeriesHubPost {
  slug: string;
  href?: string;
  available: boolean;
  articleTitle?: string;
}

export type SeriesRouteKind = 'article' | 'hub' | 'index';
