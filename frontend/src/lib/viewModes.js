export const VIEW_MODES = {
  regular: 'regular',
  collapsible: 'collapsible',
  outline: 'outline',
};

export const DEFAULT_VIEW_MODE = VIEW_MODES.regular;

export const VIEW_MODE_OPTIONS = [
  {
    id: VIEW_MODES.regular,
    label: 'Completo',
    description: 'Texto completo de cada sección, siempre visible.',
  },
  {
    id: VIEW_MODES.collapsible,
    label: 'Secciones plegables',
    description: 'Índice fijo; abre solo las secciones que quieras leer.',
  },
  {
    id: VIEW_MODES.outline,
    label: 'Esquema bíblico',
    description: 'Todos los puntos visibles; el cuerpo muestra solo citas bíblicas.',
  },
];

export function getViewModeOption(id) {
  return VIEW_MODE_OPTIONS.find((option) => option.id === id);
}
