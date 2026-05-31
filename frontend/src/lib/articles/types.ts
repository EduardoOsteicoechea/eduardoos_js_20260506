export interface ContentBlock {
  text?: string;
  biblical_reference?: string;
  emphasized_phrases?: string[];
  image?: string;
  alt?: string;
  list?: string[];
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
}
