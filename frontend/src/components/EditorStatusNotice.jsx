import { useEffect } from 'react';

const VARIANT_CLASS = {
  success:
    'border-green-500/50 bg-green-500/10 text-green-800 dark:text-green-300',
  warning:
    'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200',
  error: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
};

/**
 * Inline status banner for the editor (success / warning / error).
 */
export default function EditorStatusNotice({
  variant = 'success',
  message,
  className = '',
  onDismiss,
  autoDismissMs,
}) {
  if (!message?.trim()) return null;

  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.success;
  const defaultDismissMs =
    variant === 'error' ? 7000 : variant === 'warning' ? 5500 : 4000;
  const dismissAfterMs = autoDismissMs ?? defaultDismissMs;

  useEffect(() => {
    if (!onDismiss) return undefined;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, dismissAfterMs);

    return () => window.clearTimeout(timer);
  }, [dismissAfterMs, message, onDismiss, variant]);

  return (
    <div
      className={`pointer-events-auto fixed left-1/2 top-5 z-[400] w-[min(92vw,48rem)] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-xl ${variantClass} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1">{message}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
