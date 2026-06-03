import { isHomePath } from './homeLayout';
import { normalizePagePath } from './pageBackgroundRoutes';

/** @typedef {'scroll-up' | 'scroll-down' | 'whatsapp' | 'linkedin' | 'chatbot' | 'site-menu'} ActivityBarControlId */

/** @typedef {'home' | 'standard' | 'editor'} ActivityBarVariant */

/**
 * @typedef {Object} ActivityBarLayout
 * @property {ActivityBarVariant} variant
 * @property {string} ariaLabel
 * @property {ActivityBarControlId[]} right
 * @property {boolean} [leftFromProps]
 * @property {boolean} [fixed]
 * @property {number} [zIndex]
 */

/** @type {ActivityBarControlId[]} */
export const HOME_ACTIVITY_BAR_RIGHT = [
  'whatsapp',
  'linkedin',
  'chatbot',
  'site-menu',
];

/** @type {ActivityBarControlId[]} */
export const STANDARD_ACTIVITY_BAR_LEFT = ['scroll-up', 'scroll-down'];

/** @type {ActivityBarControlId[]} */
export const STANDARD_ACTIVITY_BAR_RIGHT = [
  'whatsapp',
  'linkedin',
  'chatbot',
  'site-menu',
];

/** @type {ActivityBarControlId[]} */
export const EDITOR_ACTIVITY_BAR_RIGHT = ['chatbot', 'site-menu'];

/**
 * @param {string} pathname
 * @returns {ActivityBarLayout}
 */
export function resolveActivityBarLayout(pathname) {
  const path = normalizePagePath(pathname);

  if (isHomePath(path)) {
    return {
      variant: 'home',
      ariaLabel: 'Controles globales',
      right: HOME_ACTIVITY_BAR_RIGHT,
      leftFromProps: false,
      fixed: false,
    };
  }

  if (path === '/post/editor' || path.startsWith('/post/editor/')) {
    return {
      variant: 'editor',
      ariaLabel: 'Controles del editor de artículos',
      right: EDITOR_ACTIVITY_BAR_RIGHT,
      leftFromProps: true,
      fixed: true,
      zIndex: 55,
    };
  }

  return {
    variant: 'standard',
    ariaLabel: 'Controles globales',
    right: STANDARD_ACTIVITY_BAR_RIGHT,
    leftFromProps: false,
    fixed: false,
  };
}

/**
 * Built-in left controls for layouts that do not use leftFromProps.
 * @param {ActivityBarLayout} layout
 * @returns {ActivityBarControlId[]}
 */
export function getActivityBarLeftControls(layout) {
  if (layout.leftFromProps) return [];
  return STANDARD_ACTIVITY_BAR_LEFT;
}
