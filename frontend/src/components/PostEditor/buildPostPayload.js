import { slugifySegment } from './slugify';
import {
  unitHasEditorContent,
  unitToContentBlock,
  unitToPreviewBlock,
} from './sections/unitToContentBlock';

export function resolveCatalogValue(isCustom, customValue, selectedValue) {
  const raw = isCustom ? customValue : selectedValue;
  return slugifySegment(raw);
}

/**
 * @param {{
 *   serie: string;
 *   serieIsCustom: boolean;
 *   serieCustom: string;
 *   chapter: string;
 *   chapterIsCustom: boolean;
 *   chapterCustom: string;
 *   creator: string;
 *   title: string;
 *   articleId: string;
 *   sections: { id: string; heading: string; content: object[] }[];
 * }} form
 * @param {{ forPreview?: boolean }} [options]
 */
export function buildPostPayload(form, options = {}) {
  const { forPreview = false } = options;
  const mapUnit = forPreview ? unitToPreviewBlock : unitToContentBlock;
  const serie = resolveCatalogValue(
    form.serieIsCustom,
    form.serieCustom,
    form.serie,
  );
  const chapter = resolveCatalogValue(
    form.chapterIsCustom,
    form.chapterCustom,
    form.chapter,
  );
  const articleId = form.articleId?.trim() || '';

  const payload = {
    serie: serie || undefined,
    chapter: chapter || undefined,
    article_id: articleId || undefined,
    creator: form.creator.trim() || undefined,
    title: form.title.trim(),
    sections: form.sections
      .map((section) => {
        const heading = section.heading.trim();
        const content = (section.content ?? [])
          .map((unit) => mapUnit(unit))
          .filter(Boolean);

        return { heading, content };
      })
      .filter((section) => section.heading || section.content.length > 0),
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined) return false;
      if (typeof value === 'string' && value === '') return false;
      return true;
    }),
  );
}

export function createEmptySection() {
  return { id: crypto.randomUUID(), heading: '', content: [] };
}

export function sectionHasEditorContent(section) {
  if (section.heading?.trim()) return true;
  return (section.content ?? []).some((unit) => unitHasEditorContent(unit));
}

export const EMPTY_FORM = {
  serie: 'romanos',
  serieIsCustom: false,
  serieCustom: '',
  chapter: 'pablo',
  chapterIsCustom: false,
  chapterCustom: '',
  creator: 'Eduardo Osteicoechea',
  title: '',
  articleId: '',
  sections: [createEmptySection()],
};
