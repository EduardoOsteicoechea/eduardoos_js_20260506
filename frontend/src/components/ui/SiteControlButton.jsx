const VARIANT_CLASS = {
  default: 'ui-control--default',
  primary: 'ui-control--primary',
  success: 'ui-control--success',
  danger: 'ui-control--danger',
  ghost: 'ui-control--ghost',
  close: 'ui-control--close',
  framed: 'ui-control--framed',
};

const SIZE_CLASS = {
  bar: 'ui-control--bar',
  md: 'ui-control--md',
};

/**
 * @param {{
 *   as?: 'button' | 'a',
 *   href?: string,
 *   target?: string,
 *   rel?: string,
 *   variant?: keyof typeof VARIANT_CLASS,
 *   size?: keyof typeof SIZE_CLASS,
 *   label?: string,
 *   icon?: import('react').ReactNode,
 *   active?: boolean,
 *   iconClassName?: string,
 *   className?: string,
 *   children?: import('react').ReactNode,
 *   type?: 'button' | 'submit' | 'reset',
 * }} props
 */
export default function SiteControlButton({
  as,
  href,
  target,
  rel,
  variant = 'default',
  size = 'md',
  label,
  icon,
  active = false,
  iconClassName = '',
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const hasIcon = Boolean(icon);
  const hasLabel = Boolean(label);
  const content =
    children ??
    (hasIcon || hasLabel ? (
      <>
        {hasIcon ? (
          <span className={['ui-control__icon', iconClassName].filter(Boolean).join(' ')}>
            {icon}
          </span>
        ) : null}
        {hasLabel ? <span className="ui-control__label">{label}</span> : null}
      </>
    ) : null);

  const classNames = [
    'ui-control',
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.default,
    SIZE_CLASS[size] ?? SIZE_CLASS.md,
    hasLabel && !hasIcon ? 'ui-control--label-only' : '',
    hasIcon && !hasLabel ? 'ui-control--icon-only' : '',
    hasIcon && hasLabel ? 'ui-control--icon-label' : '',
    active ? 'ui-control--active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const shared = {
    className: classNames,
    ...props,
  };

  if (as === 'a' || href) {
    return (
      <a href={href} target={target} rel={rel} {...shared}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} {...shared}>
      {content}
    </button>
  );
}
