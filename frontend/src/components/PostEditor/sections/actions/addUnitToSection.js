import { createUnit } from './createUnit';

/**
 * @param {import('../unitTypes').UnitType} type
 * @param {Array<{ id: string }>} currentContent
 */
export function addUnitToSection(type, currentContent = []) {
  const unit = createUnit(type);
  return [...currentContent, unit];
}
