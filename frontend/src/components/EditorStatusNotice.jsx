import { useEffect } from 'react';

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
      className={`editor-status-notice editor-status-notice--${variant} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="editor-status-notice__inner">
        <p className="editor-status-notice__message">{message}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="editor-status-notice__dismiss"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
