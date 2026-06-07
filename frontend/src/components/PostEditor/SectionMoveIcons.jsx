const iconProps = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  'aria-hidden': true,
};

export function SectionMoveUpIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 19V5" strokeLinecap="round" />
      <path d="m5 12 7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SectionMoveDownIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5v14" strokeLinecap="round" />
      <path d="m19 12-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
