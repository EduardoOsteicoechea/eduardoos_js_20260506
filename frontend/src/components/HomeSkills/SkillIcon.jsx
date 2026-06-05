const iconProps = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

/** @param {{ id: string, className?: string }} props */
export default function SkillIcon({ id, className = '' }) {
  const svgClass = ['home-skills__icon', className].filter(Boolean).join(' ');

  switch (id) {
    case 'problem-solving':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M18 28c2-8 8-12 14-12s12 4 14 12" />
          <path d="M22 36c1 6 6 10 12 10s11-4 12-10" />
          <circle cx="28" cy="24" r="2" fill="currentColor" stroke="none" />
          <circle cx="36" cy="24" r="2" fill="currentColor" stroke="none" />
          <path d="M30 30h4" />
          <path d="M32 38v6M28 44h8" />
        </svg>
      );
    case 'ai-driven-dev':
      return (
        <svg {...iconProps} className={svgClass}>
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="22"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            AI
          </text>
        </svg>
      );
    case 'ai-integration':
      return (
        <svg {...iconProps} className={svgClass}>
          <circle cx="18" cy="20" r="4" />
          <circle cx="18" cy="32" r="4" />
          <circle cx="18" cy="44" r="4" />
          <circle cx="46" cy="20" r="4" />
          <circle cx="46" cy="32" r="4" />
          <circle cx="46" cy="44" r="4" />
          <path d="M22 20h16M22 32h16M22 44h16M22 26l20 4M22 38l20-8" />
        </svg>
      );
    case 'web-dev':
      return (
        <svg {...iconProps} className={svgClass}>
          <circle cx="32" cy="32" r="6" />
          <path d="M32 10v8M32 46v8M10 32h8M46 32h8" />
          <path d="M16 16l6 6M42 42l6 6M48 16l-6 6M22 42l-6 6" />
          <path d="M20 32h4M40 32h4M32 20v4M32 40v4" />
        </svg>
      );
    case 'desktop-dev':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="14" y="16" width="36" height="26" rx="2" />
          <path d="M22 46h20" />
          <path d="M18 50h28" />
          <rect x="20" y="52" width="24" height="6" rx="1" />
        </svg>
      );
    case 'cloud-dev':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M20 40c0-8 6-14 14-14 7 0 12 5 13 11 5 1 9 6 9 12 0 7-6 13-13 13H22c-6 0-11-5-11-11z" />
          <path d="M26 34l4 4 8-8" strokeWidth="2" />
        </svg>
      );
    case 'architecture':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M32 12L14 52h36L32 12z" />
          <path d="M22 52V32M28 52V24M36 52V24M42 52V32" />
        </svg>
      );
    case 'bim':
      return (
        <svg {...iconProps} className={svgClass}>
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="20"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            BIM
          </text>
        </svg>
      );
    case 'revit-api':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="16" y="16" width="32" height="32" rx="2" />
          <path
            d="M28 44V24l8 6 8-6v20"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    case 'dynamo-scripting':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="14" y="22" width="16" height="12" rx="2" />
          <rect x="34" y="30" width="16" height="12" rx="2" />
          <path d="M30 28c6 0 8 4 8 8" />
          <circle cx="30" cy="28" r="2" fill="currentColor" stroke="none" />
          <circle cx="34" cy="36" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'dynamo-nodes':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="12" y="18" width="18" height="14" rx="2" />
          <rect x="34" y="32" width="18" height="14" rx="2" />
          <path d="M30 25h8l6 12" />
          <circle cx="30" cy="25" r="2" fill="currentColor" stroke="none" />
          <circle cx="34" cy="32" r="2" fill="currentColor" stroke="none" />
          <path d="M18 25v14M43 32v14" />
        </svg>
      );
    case 'autocad-api':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="16" y="16" width="32" height="32" rx="2" />
          <path d="M32 44V22M24 32h16" strokeWidth="2" />
        </svg>
      );
    case 'python':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M44 28c-6-10-18-8-22 2-3 8 2 16 10 18 8 2 18-4 20-14 2-10-4-16-8-6z" />
          <circle cx="28" cy="26" r="2" fill="currentColor" stroke="none" />
          <circle cx="38" cy="38" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'csharp-dotnet':
      return (
        <svg {...iconProps} className={svgClass}>
          <text
            x="32"
            y="28"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            C#
          </text>
          <text
            x="32"
            y="44"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="11"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
          >
            .NET
          </text>
        </svg>
      );
    case 'collaboration':
      return (
        <svg {...iconProps} className={svgClass}>
          <circle cx="32" cy="24" r="6" />
          <path d="M20 46c0-6 5-10 12-10s12 4 12 10" />
          <circle cx="18" cy="30" r="4" />
          <circle cx="46" cy="30" r="4" />
          <path d="M12 48c0-4 3-7 6-7M52 48c0-4-3-7-6-7" />
        </svg>
      );
    case 'writing':
      return (
        <svg {...iconProps} className={svgClass}>
          <rect x="18" y="14" width="28" height="36" rx="2" />
          <path d="M24 24h16M24 32h16M24 40h10" />
          <circle cx="22" cy="24" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="22" cy="32" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="22" cy="40" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'speaking':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M26 48V28h12v20" />
          <path d="M22 48h20v4H22z" />
          <circle cx="32" cy="20" r="5" />
          <path d="M40 22c4 2 6 6 6 10M24 22c-4 2-6 6-6 10" />
        </svg>
      );
    case 'leadership':
      return (
        <svg {...iconProps} className={svgClass}>
          <circle cx="32" cy="22" r="7" />
          <path d="M22 48c0-8 4-12 10-12s10 4 10 12" />
          <circle cx="16" cy="34" r="4" />
          <circle cx="48" cy="34" r="4" />
          <path d="M12 48c0-4 2-7 4-7M52 48c0-4-2-7-4-7" />
        </svg>
      );
    case 'customer-care':
      return (
        <svg {...iconProps} className={svgClass}>
          <path d="M14 36c4-6 10-8 18-8s14 2 18 8" />
          <path d="M20 36c2 4 6 6 12 6s10-2 12-6" />
          <path d="M18 40c3 2 8 3 14 3s11-1 14-3" />
          <path d="M22 32l4 4 4-4M34 32l4 4 4-4" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} className={svgClass}>
          <circle cx="32" cy="32" r="12" />
        </svg>
      );
  }
}
