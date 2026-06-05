/** Small checklist badge shown on editor unit-type buttons (key units). */
export function KeyUnitBadge() {
  return (
    <span
      className="unit-type-icon__key-badge"
      aria-hidden="true"
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * @param {import('./unitTypes').UnitType} type
 */
export function renderUnitTypeIcon(type) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    'aria-hidden': true,
  };

  switch (type) {
    case 'paragraph':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common}>
          <path d="M9 6h12M9 12h12M9 18h12" strokeLinecap="round" />
          <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'biblical_quote':
      return (
        <svg {...common}>
          <path d="M7 6h10v12H7z" />
          <path d="M9 9h6M9 13h4" strokeLinecap="round" />
        </svg>
      );
    case 'link':
      return (
        <svg {...common}>
          <path d="M10 14a4 4 0 0 0 5.7 0l2-2a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-2 2a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <path d="M4 17l5-5 4 4 3-3 4 4" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...common}>
          <path d="M11 6v12l-4-2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2l4-2z" />
          <path d="M16 10a3 3 0 0 1 0 4" />
        </svg>
      );
    case 'video':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M10 10l6 4-6 4z" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export function AddUnitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function DoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
