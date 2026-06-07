import { isUnitType } from './unitTypes';

/**
 * @param {Record<string, unknown>} block
 */
export function createUnitFromBlock(block) {
  const id = crypto.randomUUID();
  const explicitType =
    typeof block.type === 'string' ? block.type.trim() : '';

  if (explicitType && isUnitType(explicitType)) {
    return buildUnitFromTypedBlock(id, explicitType, block);
  }

  if (Array.isArray(block.list)) {
    return buildUnitFromTypedBlock(id, 'list', block);
  }

  if (block.biblical_reference != null) {
    return buildUnitFromTypedBlock(id, 'biblical_quote', block);
  }

  if (block.image != null || (block.name != null && block.video == null && block.audio == null)) {
    return buildUnitFromTypedBlock(id, 'image', block);
  }

  if (block.video != null || block.caption != null) {
    return buildUnitFromTypedBlock(id, 'video', block);
  }

  if (block.audio != null || block.label != null) {
    return buildUnitFromTypedBlock(id, 'audio', block);
  }

  if (block.href != null) {
    return buildUnitFromTypedBlock(id, 'link', block);
  }

  return buildUnitFromTypedBlock(id, 'paragraph', block);
}

/**
 * @param {string} id
 * @param {import('./unitTypes').UnitType} type
 * @param {Record<string, unknown>} block
 */
function buildUnitFromTypedBlock(id, type, block) {
  switch (type) {
    case 'list': {
      const list = Array.isArray(block.list)
        ? block.list.map((item) => {
            if (typeof item === 'string') {
              return { content: item, emphasized: '' };
            }
            if (item && typeof item === 'object') {
              const record = /** @type {Record<string, unknown>} */ (item);
              return {
                content: String(record.content ?? record.text ?? ''),
                emphasized: Array.isArray(record.emphasized_phrases)
                  ? String(record.emphasized_phrases[0] ?? '')
                  : String(record.emphasized ?? ''),
              };
            }
            return { content: '', emphasized: '' };
          })
        : [{ content: '', emphasized: '' }];

      return {
        id,
        type: 'list',
        data: {
          list: list.length ? list : [{ content: '', emphasized: '' }],
          ordered: Boolean(block.ordered),
        },
      };
    }

    case 'biblical_quote':
      return {
        id,
        type,
        data: {
          content: String(block.content ?? block.text ?? ''),
          emphasized: Array.isArray(block.emphasized_phrases)
            ? String(block.emphasized_phrases[0] ?? '')
            : String(block.emphasized ?? ''),
          reference: String(block.reference ?? block.biblical_reference ?? ''),
        },
      };

    case 'image':
      return {
        id,
        type,
        data: {
          image: String(block.image ?? block.url ?? ''),
          alt: String(block.alt ?? ''),
          name: String(block.name ?? block.fileName ?? ''),
        },
      };

    case 'video':
      return {
        id,
        type,
        data: {
          video: String(block.video ?? block.url ?? ''),
          alt: String(block.alt ?? block.text ?? block.caption ?? ''),
          name: String(block.name ?? block.fileName ?? ''),
        },
      };

    case 'audio':
      return {
        id,
        type,
        data: {
          audio: String(block.audio ?? block.url ?? ''),
          text: String(block.text ?? block.label ?? ''),
          name: String(block.name ?? block.fileName ?? ''),
        },
      };

    case 'link':
      return {
        id,
        type,
        data: {
          href: String(block.href ?? ''),
          text: String(block.text ?? ''),
        },
      };

    case 'key_idea':
    case 'paragraph':
    default:
      return {
        id,
        type: type === 'key_idea' ? 'key_idea' : 'paragraph',
        data: {
          content: String(block.content ?? block.text ?? ''),
          emphasized: Array.isArray(block.emphasized_phrases)
            ? String(block.emphasized_phrases[0] ?? '')
            : String(block.emphasized ?? ''),
        },
      };
  }
}
