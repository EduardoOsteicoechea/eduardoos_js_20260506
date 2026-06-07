/** @typedef {'home' | 'posts' | 'editor'} NavLinkIconId */

/** Navigation links shown to visitors (no auth). */
export const PUBLIC_NAV_LINKS = [
  { href: '/', labelKey: 'home', icon: 'home' },
  { href: '/series', labelKey: 'posts', icon: 'posts' },
  { href: '/post/editor', labelKey: 'editor', icon: 'editor' },
  { href: '/post/catalog', labelKey: 'catalog', icon: 'editor' },
];
