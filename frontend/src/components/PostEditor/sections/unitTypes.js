/** @typedef {'paragraph' | 'list' | 'key_idea' | 'biblical_quote' | 'image' | 'video' | 'audio' | 'link'} UnitType */

export const UNIT_TYPES = [
  {
    id: 'paragraph',
    label: 'Párrafo',
    description: 'Texto narrativo o explicativo.',
    keyUnit: true,
  },
  {
    id: 'list',
    label: 'Lista',
    description: 'Viñetas u orden numerada.',
    keyUnit: true,
  },
  {
    id: 'key_idea',
    label: 'Idea clave',
    description: 'Frase destacada con énfasis (solo lectura en artículos existentes).',
    keyUnit: true,
    legacy: true,
  },
  {
    id: 'biblical_quote',
    label: 'Cita bíblica',
    description: 'Texto con referencia bíblica.',
    keyUnit: true,
  },
  {
    id: 'link',
    label: 'Enlace',
    description: 'Hipervínculo externo.',
    keyUnit: true,
  },
  {
    id: 'image',
    label: 'Imagen',
    description: 'Archivo o URL de imagen.',
    keyUnit: true,
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Enlace o archivo de audio.',
    keyUnit: true,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Enlace o archivo de video.',
    keyUnit: true,
  },
];

/** Order for the section editor unit tray (key units; no legacy key_idea). */
export const EDITOR_UNIT_TYPE_ORDER = [
  'paragraph',
  'list',
  'biblical_quote',
  'link',
  'image',
  'audio',
  'video',
];

export function getEditorAddableUnitTypes() {
  return EDITOR_UNIT_TYPE_ORDER.map((id) => UNIT_TYPES.find((entry) => entry.id === id)).filter(
    Boolean,
  );
}

/**
 * @param {string} type
 * @returns {UnitType | undefined}
 */
export function isUnitType(type) {
  return UNIT_TYPES.some((entry) => entry.id === type);
}

/**
 * @param {UnitType} type
 */
export function getUnitTypeLabel(type) {
  return UNIT_TYPES.find((entry) => entry.id === type)?.label ?? type;
}
