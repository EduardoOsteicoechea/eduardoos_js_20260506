/** @typedef {'mobile' | 'tablet' | 'desktop'} PageBackgroundBreakpoint */

/**
 * @typedef {Object} PageBackgroundImagePosition
 * @property {string} [objectPosition] - CSS object-position (e.g. "50% 20%")
 * @property {string} [translateX] - Extra translate X on image wrapper (e.g. "0%", "-2%")
 * @property {string} [translateY] - Extra translate Y on image wrapper
 * @property {string} [scale] - Extra scale on image wrapper (e.g. "1")
 * @property {number} [leftPx] - Distance from viewport left
 * @property {number} [topPx] - Distance from viewport top
 */

/**
 * @typedef {Object} PageBackgroundRouteRule
 * @property {string[]} patterns - Path patterns: exact "/profile", prefix "/articles/*"
 * @property {boolean} [show] - false hides the background entirely (default true when matched)
 * @property {string} [overlay] - CSS color for overlay layer (e.g. "rgba(255,255,255,0.05)")
 * @property {number} [blurPx] - backdrop-filter blur in pixels
 * @property {Partial<Record<PageBackgroundBreakpoint, PageBackgroundImagePosition>>} [position]
 */

export const PAGE_BACKGROUND_IMAGE = '/personal_photo_cropped.webp';

const DEFAULT_POSITION = {
  mobile: {
    objectPosition: 'left center',
    translateX: '0%',
    translateY: '0%',
    scale: '1',
    leftPx: 12,
    topPx: 12,
  },
  tablet: {
    objectPosition: 'left center',
    translateX: '0%',
    translateY: '0%',
    scale: '1',
    leftPx: 20,
    topPx: 16,
  },
  desktop: {
    objectPosition: 'left center',
    translateX: '0%',
    translateY: '0%',
    scale: '1',
    leftPx: 40,
    topPx: 24,
  },
};

/**
 * First matching rule wins. Put more specific patterns before broader ones.
 * @type {PageBackgroundRouteRule[]}
 */
export const PAGE_BACKGROUND_ROUTES = [
  {
    patterns: ['/articles', '/articles/*'],
    show: false,
  },
  {
    patterns: ['/post/editor', '/post/creator'],
    show: false,
  },
  {
    patterns: ['/server/health'],
    show: false,
  },
  {
    patterns: ['/series/*'],
    show: false,
  },
  {
    patterns: ['/'],
    show: true,
    blurPx: 0,
    position: {
      ...DEFAULT_POSITION,
      mobile: {
        objectPosition: 'center bottom',
        translateX: '0%',
        translateY: '0%',
        scale: '1',
        leftPx: 0,
        topPx: 0,
      },
    },
  },
  {
    patterns: ['/profile', '/profile/*'],
    show: true,
    blurPx: 0,
    position: DEFAULT_POSITION,
  },
];

/**
 * @param {string} pathname
 * @returns {string}
 */
export function normalizePagePath(pathname) {
  const path = pathname.split('?')[0].split('#')[0] || '/';
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path || '/';
}

/**
 * @param {string} path
 * @param {string} pattern
 */
export function matchPageBackgroundPattern(path, pattern) {
  const normalizedPattern =
    pattern.length > 1 && pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;

  if (normalizedPattern.endsWith('/*')) {
    const base = normalizedPattern.slice(0, -2);
    return path.startsWith(`${base}/`);
  }

  return path === normalizedPattern;
}

/**
 * @param {string} pathname
 * @returns {{ show: false } | { show: true, overlay: string, blurPx: number, position: Record<PageBackgroundBreakpoint, PageBackgroundImagePosition> }}
 */
export function getPageBackgroundConfig(pathname) {
  const path = normalizePagePath(pathname);

  for (const rule of PAGE_BACKGROUND_ROUTES) {
    const matched = rule.patterns.some((pattern) =>
      matchPageBackgroundPattern(path, pattern),
    );
    if (!matched) continue;

    if (rule.show === false) {
      return { show: false };
    }

    return {
      show: true,
      overlay: rule.overlay ?? 'rgba(255,255,255,0.05)',
      blurPx: rule.blurPx ?? 5,
      position: {
        mobile: { ...DEFAULT_POSITION.mobile, ...rule.position?.mobile },
        tablet: { ...DEFAULT_POSITION.tablet, ...rule.position?.tablet },
        desktop: { ...DEFAULT_POSITION.desktop, ...rule.position?.desktop },
      },
    };
  }

  return { show: false };
}

/**
 * Inline style for image wrapper CSS variables (suffix "" = mobile, "-tablet", "-desktop").
 * @param {PageBackgroundImagePosition} pos
 * @param {'' | 'tablet' | 'desktop'} [breakpoint]
 */
export function imagePositionStyleVars(pos, breakpoint = '') {
  const suffix = breakpoint ? `-${breakpoint}` : '';
  const vars = {
    [`--bg-object-position${suffix}`]: pos.objectPosition ?? 'left center',
    [`--bg-translate-x${suffix}`]: pos.translateX ?? '0%',
    [`--bg-translate-y${suffix}`]: pos.translateY ?? '0%',
    [`--bg-scale${suffix}`]: pos.scale ?? '1',
  };

  if (pos.leftPx != null) {
    vars[`--bg-left${suffix}`] = `${pos.leftPx}px`;
  }
  if (pos.topPx != null) {
    vars[`--bg-top${suffix}`] = `${pos.topPx}px`;
  }

  return vars;
}
