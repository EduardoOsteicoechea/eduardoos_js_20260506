import { useEffect, useRef, useState } from 'react';

export default function SavePasswordModal({
  open,
  isSubmitting,
  error,
  onClose,
  onConfirm,
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
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="theme-border theme-surface w-full max-w-md rounded-xl border p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="save-password-title" className="text-xl font-semibold">
          Confirmar guardado
        </h2>
        <p className="theme-muted mt-2 text-sm">
          Introduce la contraseña del editor para guardar este artículo.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="editor-password" className="mb-1 block text-sm font-medium">
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
              className="theme-border w-full rounded-lg border bg-transparent px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="theme-toolbar-btn disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="theme-toolbar-btn disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
