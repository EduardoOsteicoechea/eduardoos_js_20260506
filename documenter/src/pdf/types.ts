export interface ArticleSection {
  heading?: string;
  content?: unknown[];
}

export interface ArticlePayload {
  serie?: string;
  series?: string;
  chapter?: string;
  section?: string;
  article_id?: string;
  folder_name?: string;
  title?: string;
  creator?: string;
  sections?: ArticleSection[];
}

export interface PersistedPdfResult {
  storagePath: string;
  absolutePath: string;
  publicPath: string;
  bytes: number;
}
