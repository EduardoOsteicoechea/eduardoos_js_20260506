import { useMemo, useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { resetPassword } from '../../lib/auth/authStore';
import './AuthForm.css';

export default function ResetPasswordForm() {
  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') ?? '';
  }, []);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!token) {
        throw new Error('Falta el token de restablecimiento.');
      }
      await resetPassword(token, password);
      setSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo restablecer la contraseña',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Nueva contraseña</h1>
        <p className="auth_form_intro">Elige una contraseña nueva para tu cuenta.</p>

        <label className="auth_form_field">
          <span className="auth_form_label">Contraseña</span>
          <input
            className={UI_FIELD_CLASS}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>

        {error ? <p className="auth_form_error">{error}</p> : null}
        {success ? <p className="auth_form_success">{success}</p> : null}

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Restablecer'}
          </button>
        </div>

        <div className="auth_form_links">
          <a href="/auth/login">Ir a iniciar sesión</a>
        </div>
      </form>
    </div>
  );
}
