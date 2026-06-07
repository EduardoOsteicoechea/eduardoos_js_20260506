import { useEffect, useRef, useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';

export default function SavePasswordModal({
  open,
  isSubmitting,
  error,
  onClose,
  onConfirm,
  title = 'Confirmar guardado',
  intro = 'Introduce la contraseña del editor para guardar este artículo.',
  submitLabel = 'Guardar',
  submittingLabel = 'Guardando…',
}) {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setPassword('');
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!password.trim() || isSubmitting) return;
    onConfirm(password);
  };

  return (
    <div
      className="save-password-overlay"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="save-password-dialog theme-border theme-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="save-password-title" className="save-password-dialog__title">
          {title}
        </h2>
        <p className="save-password-dialog__intro theme-muted">{intro}</p>

        <form onSubmit={handleSubmit} className="save-password-dialog__form">
          <div>
            <label htmlFor="editor-password" className="post-editor__label">
              Contraseña
            </label>
            <input
              ref={inputRef}
              id="editor-password"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              className={UI_FIELD_CLASS}
            />
          </div>

          {error ? (
            <p className="save-password-dialog__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="save-password-dialog__actions">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="theme-toolbar-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="theme-toolbar-btn"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
