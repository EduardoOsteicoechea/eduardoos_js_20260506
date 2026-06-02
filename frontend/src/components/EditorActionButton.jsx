const VARIANT_CLASS = {
  default: '',
  danger:
    'border-red-500/60 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300',
  primary:
    'border-blue-500/60 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300',
  success:
    'border-green-500/60 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-300',
};

/**
 * Toolbar action button with shared styling; parent supplies onClick/disabled/children.
 */
export default function EditorActionButton({
  variant = 'default',
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;

  return (
    <button
      type={type}
      className={`theme-toolbar-btn ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
}
