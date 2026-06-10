import { useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { forgotPassword } from '../../lib/auth/authStore';
import './AuthForm.css';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess('Si el correo existe, recibirás un enlace para restablecer la contraseña.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo enviar el correo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Recuperar contraseña</h1>
        <p className="auth_form_intro">
          Introduce tu correo y te enviaremos un enlace de restablecimiento.
        </p>

        <label className="auth_form_field">
          <span className="auth_form_label">Correo</span>
          <input
            className={UI_FIELD_CLASS}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {error ? <p className="auth_form_error">{error}</p> : null}
        {success ? <p className="auth_form_success">{success}</p> : null}

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </div>

        <div className="auth_form_links">
          <a href="/auth/login">Volver a iniciar sesión</a>
        </div>
      </form>
    </div>
  );
}
