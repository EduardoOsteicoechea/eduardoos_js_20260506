/** @typedef {'home' | 'posts' | 'editor' | 'catalog'} NavLinkIconId */

/** Navigation links shown to visitors (no auth). */
export const PUBLIC_NAV_LINKS = [
  { href: '/', labelKey: 'home', icon: 'home' },
  { href: '/series', labelKey: 'posts', icon: 'posts' },
  { href: '/catalog', labelKey: 'catalog', icon: 'catalog' },
  { href: '/post/editor', labelKey: 'editor', icon: 'editor' },
];
