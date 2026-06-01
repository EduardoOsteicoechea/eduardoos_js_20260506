import {
  unitHasContent,
  unitToArticleBlock,
  unitToEditorPreviewBlock,
} from './unitContentModel';

export function unitToContentBlock(unit) {
  return unitToArticleBlock(unit);
}

export function unitToPreviewBlock(unit) {
  return unitToEditorPreviewBlock(unit);
}

export function unitHasEditorContent(unit) {
  return unitHasContent(unit);
}
