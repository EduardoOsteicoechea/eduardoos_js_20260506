import { useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { register } from '../../lib/auth/authStore';
import './AuthForm.css';

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ email, password, display_name: displayName });
      window.location.href = '/auth/validate-email?registered=1';
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo crear la cuenta',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Crear cuenta</h1>
        <p className="auth_form_intro">
          Te enviaremos un correo para verificar tu dirección.
        </p>

        <label className="auth_form_field">
          <span className="auth_form_label">Nombre</span>
          <input
            className={UI_FIELD_CLASS}
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>

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

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Registrarse'}
          </button>
        </div>

        <div className="auth_form_links">
          <a href="/auth/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}
