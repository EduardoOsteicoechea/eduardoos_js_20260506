export const FONT_FAMILY_IDS = {
  montserrat: 'montserrat',
  raleway: 'raleway',
  roboto: 'roboto',
  system: 'system',
};

export const FONT_FAMILIES = [
  {
    id: FONT_FAMILY_IDS.montserrat,
    label: 'Montserrat',
    stack: '"Montserrat", sans-serif',
  },
  {
    id: FONT_FAMILY_IDS.raleway,
    label: 'Raleway',
    stack: '"Raleway", sans-serif',
  },
  {
    id: FONT_FAMILY_IDS.roboto,
    label: 'Roboto',
    stack: '"Roboto", sans-serif',
  },
  {
    id: FONT_FAMILY_IDS.system,
    label: 'System UI',
    stack:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
];

export const DEFAULT_FONT_FAMILY_ID = FONT_FAMILY_IDS.montserrat;

export function getFontFamilyById(id) {
  return (
    FONT_FAMILIES.find((font) => font.id === id) ??
    FONT_FAMILIES.find((font) => font.id === DEFAULT_FONT_FAMILY_ID)
  );
}

export function applyFontFamilyToDocument(id) {
  if (typeof document === 'undefined') return;
  const font = getFontFamilyById(id);
  document.documentElement.style.setProperty('--font-family', font.stack);
}
