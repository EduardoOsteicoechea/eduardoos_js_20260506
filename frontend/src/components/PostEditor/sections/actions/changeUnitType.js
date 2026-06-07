import {
  commitMediaUnitFields,
  normalizeUnitData,
  unitIsMediaType,
  unitSupportsTextEmphasis,
} from '../unitContentModel';
import { createUnit } from './createUnit';
import { isUnitType } from '../unitTypes';

/**
 * @param {{ id: string, type: string, data: Record<string, unknown> }} unit
 * @param {import('../unitTypes').UnitType} newType
 */
export function changeUnitType(unit, newType) {
  if (!isUnitType(newType) || unit.type === newType) {
    return unit;
  }

  return {
    id: unit.id,
    type: newType,
    data: migrateUnitData(unit, newType),
  };
}

/**
 * @param {{ id: string, type: string, data: Record<string, unknown> }} unit
 * @param {import('../unitTypes').UnitType} newType
 */
function migrateUnitData(unit, newType) {
  const normalized = normalizeUnitData(unit);
  const fresh = createUnit(newType).data;

  if (newType === 'paragraph' || newType === 'key_idea' || newType === 'biblical_quote') {
    let content = '';
    let emphasized = '';
    let reference = '';

    if (unit.type === 'list') {
      content = String(normalized.list?.[0]?.content ?? '');
      emphasized = String(normalized.list?.[0]?.emphasized ?? '');
    } else if (unit.type === 'link') {
      content = String(normalized.text ?? '');
    } else if (unitIsMediaType(unit.type)) {
      content = String(normalized.label ?? '');
    } else if (unitSupportsTextEmphasis(unit.type) || unit.type === 'biblical_quote') {
      content = String(normalized.content ?? '');
      emphasized = String(normalized.emphasized ?? '');
      reference = String(normalized.reference ?? '');
    }

    if (newType === 'biblical_quote') {
      return { content, emphasized, reference };
    }

    return { content, emphasized };
  }

  if (newType === 'list') {
    if (unit.type === 'list') {
      return {
        list: normalized.list,
        ordered: Boolean(normalized.ordered),
      };
    }

    const content =
      unitSupportsTextEmphasis(unit.type) || unit.type === 'biblical_quote'
        ? String(normalized.content ?? '')
        : unit.type === 'link'
          ? String(normalized.text ?? '')
          : '';

    return {
      list: [{ content, emphasized: '' }],
      ordered: false,
    };
  }

  if (unitIsMediaType(newType)) {
    if (unitIsMediaType(unit.type)) {
      return commitMediaUnitFields(newType, {
        src: normalized.src,
        label: normalized.label,
        name: normalized.name,
      });
    }
    return fresh;
  }

  if (newType === 'link') {
    if (unit.type === 'link') {
      return {
        href: String(normalized.href ?? ''),
        text: String(normalized.text ?? ''),
      };
    }

    const text =
      unitSupportsTextEmphasis(unit.type) || unit.type === 'biblical_quote'
        ? String(normalized.content ?? '')
        : '';

    return { href: '', text };
  }

  return fresh;
}
