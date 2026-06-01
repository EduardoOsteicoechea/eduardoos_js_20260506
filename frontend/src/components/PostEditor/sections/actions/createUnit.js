import { isUnitType } from '../unitTypes';

/**
 * @param {import('../unitTypes').UnitType} type
 */
export function createUnit(type) {
  if (!isUnitType(type)) {
    throw new Error(`Tipo de unidad no válido: ${type}`);
  }

  const id = crypto.randomUUID();

  switch (type) {
    case 'paragraph':
    case 'key_idea':
      return {
        id,
        type,
        data: { content: '', emphasized: '' },
      };

    case 'list':
      return {
        id,
        type,
        data: { list: [{ content: '', emphasized: '' }], ordered: false },
      };

    case 'biblical_quote':
      return {
        id,
        type,
        data: { content: '', emphasized: '', reference: '' },
      };

    case 'image':
      return {
        id,
        type,
        data: { image: '', alt: '' },
      };

    case 'video':
      return {
        id,
        type,
        data: { video: '', alt: '' },
      };

    case 'audio':
      return {
        id,
        type,
        data: { audio: '', text: '' },
      };

    case 'link':
      return {
        id,
        type,
        data: { href: '', text: '' },
      };

    default:
      throw new Error(`Tipo de unidad no implementado: ${type}`);
  }
}
