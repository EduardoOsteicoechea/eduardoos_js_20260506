/** @typedef {'paragraph' | 'list' | 'key_idea' | 'biblical_quote' | 'image' | 'video' | 'audio' | 'link'} UnitType */

export const UNIT_TYPES = [
  {
    id: 'paragraph',
    label: 'Párrafo',
    description: 'Texto narrativo o explicativo.',
  },
  {
    id: 'list',
    label: 'Lista',
    description: 'Viñetas u orden numerada.',
  },
  {
    id: 'key_idea',
    label: 'Idea clave',
    description: 'Frase destacada con énfasis.',
  },
  {
    id: 'biblical_quote',
    label: 'Cita bíblica',
    description: 'Texto con referencia bíblica.',
  },
  {
    id: 'image',
    label: 'Imagen',
    description: 'Archivo o URL de imagen.',
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Enlace o archivo de video.',
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Enlace o archivo de audio.',
  },
  {
    id: 'link',
    label: 'Enlace',
    description: 'Hipervínculo externo.',
  },
];

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
