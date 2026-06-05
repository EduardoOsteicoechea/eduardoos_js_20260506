const TEXT_UNIT_TYPES = new Set(['paragraph', 'key_idea', 'biblical_quote']);

export function unitSupportsTextEmphasis(type) {
  return TEXT_UNIT_TYPES.has(type);
}

const MEDIA_UNIT_TYPES = new Set(['image', 'video', 'audio']);
const EDITOR_UNIT_TYPES = new Set([
  'paragraph',
  'key_idea',
  'biblical_quote',
  'list',
  'image',
  'video',
  'audio',
  'link',
]);

export function unitSupportsEditor(type) {
  return EDITOR_UNIT_TYPES.has(type);
}

export function unitIsMediaType(type) {
  return MEDIA_UNIT_TYPES.has(type);
}

/**
 * @param {'image' | 'video' | 'audio'} type
 * @param {Record<string, unknown>} data
 */
export function normalizeMediaUnitData(type, data) {
  const srcKey = type === 'image' ? 'image' : type === 'video' ? 'video' : 'audio';
  return {
    src: String(data[srcKey] ?? data.url ?? ''),
    label: String(data.label ?? data.alt ?? data.text ?? ''),
    name: String(data.name ?? data.fileName ?? ''),
  };
}

/**
 * @param {'image' | 'video' | 'audio'} type
 * @param {{ src?: string, label?: string, name?: string }} fields
 */
export function commitMediaUnitFields(type, fields) {
  const src = String(fields.src ?? '').trim();
  const label = String(fields.label ?? '').trim();
  const name = String(fields.name ?? '').trim();

  if (type === 'image') {
    return {
      ...(src ? { image: src } : {}),
      ...(label ? { alt: label } : {}),
      ...(name ? { name } : {}),
    };
  }

  if (type === 'video') {
    return {
      ...(src ? { video: src } : {}),
      ...(label ? { alt: label } : {}),
      ...(name ? { name } : {}),
    };
  }

  return {
    ...(src ? { audio: src } : {}),
    ...(label ? { text: label } : {}),
    ...(name ? { name } : {}),
  };
}

/**
 * @param {Record<string, unknown>} data
 */
export function normalizeLinkUnitData(data) {
  return {
    href: String(data.href ?? ''),
    text: String(data.text ?? ''),
  };
}

/**
 * @param {{ href?: string, text?: string }} fields
 */
export function commitLinkUnitFields(fields) {
  return {
    href: String(fields.href ?? '').trim(),
    text: String(fields.text ?? '').trim(),
  };
}

/**
 * @param {unknown} item
 */
export function normalizeListItem(item) {
  if (typeof item === 'string') {
    const content = item;
    return { content, emphasized: '' };
  }

  if (item && typeof item === 'object') {
    const record = /** @type {Record<string, unknown>} */ (item);
    const content = String(record.content ?? record.text ?? '');
    const emphasized =
      record.emphasized != null
        ? String(record.emphasized)
        : Array.isArray(record.emphasized_phrases) && record.emphasized_phrases[0]
          ? String(record.emphasized_phrases[0])
          : '';
    return {
      content,
      emphasized: matchEmphasizedInContent(content, emphasized),
    };
  }

  return { content: '', emphasized: '' };
}

/**
 * @param {unknown} list
 */
export function normalizeListItems(list) {
  if (!Array.isArray(list) || !list.length) {
    return [{ content: '', emphasized: '' }];
  }
  return list.map(normalizeListItem);
}

/**
 * @param {{ list?: unknown[], ordered?: boolean }} fields
 */
export function commitListUnitFields(fields) {
  const items = normalizeListItems(fields.list).map((item) => ({
    content: String(item.content ?? ''),
    emphasized: matchEmphasizedInContent(
      String(item.content ?? ''),
      item.emphasized,
    ),
  }));

  const committed = { list: items };
  if (fields.ordered) committed.ordered = true;
  return committed;
}

/**
 * @param {{ type: string, data: Record<string, unknown> }} unit
 */
export function normalizeUnitData(unit) {
  const { type, data } = unit;

  if (type === 'paragraph' || type === 'key_idea') {
    const content = String(data.content ?? data.text ?? '');
    const emphasized =
      data.emphasized != null
        ? String(data.emphasized)
        : Array.isArray(data.emphasized_phrases) && data.emphasized_phrases[0]
          ? String(data.emphasized_phrases[0])
          : '';
    return { content, emphasized: matchEmphasizedInContent(content, emphasized) };
  }

  if (type === 'biblical_quote') {
    const content = String(data.content ?? data.text ?? '');
    const emphasized =
      data.emphasized != null
        ? String(data.emphasized)
        : Array.isArray(data.emphasized_phrases) && data.emphasized_phrases[0]
          ? String(data.emphasized_phrases[0])
          : '';
    return {
      content,
      emphasized: matchEmphasizedInContent(content, emphasized),
      reference: String(data.reference ?? data.biblical_reference ?? ''),
    };
  }

  if (type === 'list') {
    return {
      list: normalizeListItems(data.list),
      ordered: Boolean(data.ordered),
    };
  }

  if (type === 'image' || type === 'video' || type === 'audio') {
    return normalizeMediaUnitData(type, data);
  }

  if (type === 'link') {
    return normalizeLinkUnitData(data);
  }

  return { ...data };
}

export function matchEmphasizedInContent(content, emphasized) {
  const phrase = String(emphasized ?? '').trim();
  if (!phrase) return '';
  return content.includes(phrase) ? phrase : '';
}

/**
 * @param {string} content
 * @param {string} emphasized
 */
export function buildEditorPreviewBlock(content, emphasized) {
  const block = { content: String(content ?? '') };
  const matched = matchEmphasizedInContent(block.content, emphasized);
  if (matched) block.emphasized = matched;
  return block;
}

/**
 * @param {string} type
 * @param {Record<string, string>} fields
 */
/**
 * @param {{ type: string, data?: Record<string, unknown> }} unit
 * @param {Record<string, unknown>} draft
 */
export function commitUnitFields(unit, draft) {
  if (unit.type === 'list') {
    return commitListUnitFields(draft);
  }

  if (unitIsMediaType(unit.type)) {
    return commitMediaUnitFields(unit.type, draft);
  }

  if (unit.type === 'link') {
    return commitLinkUnitFields(draft);
  }

  return commitTextUnitFields(unit.type, draft);
}

export function commitTextUnitFields(type, fields) {
  const content = String(fields.content ?? '');
  const emphasized = matchEmphasizedInContent(content, fields.emphasized);

  if (type === 'biblical_quote') {
    return {
      content,
      emphasized,
      reference: String(fields.reference ?? '').trim(),
    };
  }

  return { content, emphasized };
}

/**
 * @param {{ type: string, data: Record<string, unknown> }} unit
 */
export function unitToEditorPreviewBlock(unit) {
  const data = normalizeUnitData(unit);

  if (unit.type === 'paragraph' || unit.type === 'key_idea') {
    return buildEditorPreviewBlock(data.content, data.emphasized);
  }

  if (unit.type === 'biblical_quote') {
    return {
      ...buildEditorPreviewBlock(data.content, data.emphasized),
      reference: data.reference,
    };
  }

  if (unit.type === 'list') {
    return {
      list: normalizeListItems(data.list).map((item) => {
        const entry = { content: item.content };
        if (item.emphasized) entry.emphasized = item.emphasized;
        return entry;
      }),
      ...(data.ordered ? { ordered: true } : {}),
    };
  }

  if (unit.type === 'image') {
    return {
      image: String(data.src ?? data.image ?? ''),
      alt: String(data.label ?? data.alt ?? ''),
      ...(data.name ? { name: data.name } : {}),
    };
  }

  if (unit.type === 'video') {
    return {
      video: String(data.src ?? data.video ?? ''),
      caption: String(data.label ?? data.alt ?? ''),
      ...(data.name ? { name: data.name } : {}),
    };
  }

  if (unit.type === 'audio') {
    return {
      audio: String(data.src ?? data.audio ?? ''),
      label: String(data.label ?? data.text ?? ''),
      ...(data.name ? { name: data.name } : {}),
    };
  }

  if (unit.type === 'link') {
    return { href: String(data.href ?? ''), text: String(data.text ?? '') };
  }

  return { type: unit.type, ...data };
}

/**
 * @param {{ type: string, data: Record<string, unknown> }} unit
 */
export function unitToArticleBlock(unit) {
  const data = normalizeUnitData(unit);

  if (unit.type === 'paragraph') {
    const content = String(data.content ?? '').trim();
    if (!content) return null;
    if (data.emphasized) {
      return { text: content, emphasized_phrases: [data.emphasized] };
    }
    return { text: content };
  }

  if (unit.type === 'key_idea') {
    const content = String(data.content ?? '').trim();
    if (!content) return null;
    if (data.emphasized) {
      return { text: content, emphasized_phrases: [data.emphasized] };
    }
    return { text: content };
  }

  if (unit.type === 'biblical_quote') {
    const content = String(data.content ?? '').trim();
    const reference = String(data.reference ?? '').trim();
    if (!content && !reference) return null;
    const block = { text: content, biblical_reference: reference };
    if (data.emphasized) block.emphasized_phrases = [data.emphasized];
    return block;
  }

  if (unit.type === 'list') {
    const items = normalizeListItems(data.list)
      .map((item) => {
        const text = String(item.content ?? '').trim();
        if (!text) return null;
        if (item.emphasized) {
          return { text, emphasized_phrases: [item.emphasized] };
        }
        return text;
      })
      .filter(Boolean);
    if (!items.length) return null;
    const block = { list: items };
    if (data.ordered) block.ordered = true;
    return block;
  }

  if (unit.type === 'image') {
    const image = String(data.src ?? data.image ?? '').trim();
    if (!image) return null;
    const block = { image };
    const name = String(data.name ?? data.fileName ?? '').trim();
    if (name) block.name = name;
    const alt = String(data.label ?? data.alt ?? '').trim();
    if (alt) block.alt = alt;
    return block;
  }

  if (unit.type === 'video') {
    const video = String(data.src ?? data.video ?? '').trim();
    if (!video) return null;
    const block = { video };
    const name = String(data.name ?? data.fileName ?? '').trim();
    if (name) block.name = name;
    const caption = String(data.label ?? data.alt ?? '').trim();
    if (caption) block.text = caption;
    return block;
  }

  if (unit.type === 'audio') {
    const audio = String(data.src ?? data.audio ?? '').trim();
    if (!audio) return null;
    const block = { audio };
    const name = String(data.name ?? data.fileName ?? '').trim();
    if (name) block.name = name;
    const text = String(data.label ?? data.text ?? '').trim();
    if (text) block.text = text;
    return block;
  }

  if (unit.type === 'link') {
    const href = String(data.href ?? '').trim();
    if (!href) return null;
    const block = { href };
    const text = String(data.text ?? '').trim();
    if (text) block.text = text;
    return block;
  }

  return null;
}

export function unitHasContent(unit) {
  return unitToArticleBlock(unit) !== null;
}
