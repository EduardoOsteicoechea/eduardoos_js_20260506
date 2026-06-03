import SiteControlButton from './ui/SiteControlButton';

/**
 * Form and toolbar actions; wraps SiteControlButton (md size by default).
 */
export default function EditorActionButton({
  variant = 'default',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <SiteControlButton
      type={type}
      variant={variant}
      size={size}
      className={className}
      {...props}
    />
  );
}
