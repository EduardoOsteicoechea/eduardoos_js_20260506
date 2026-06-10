import { useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import { login } from '../../lib/auth/authStore';
import './AuthForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next || '/auth/profile';
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo iniciar sesión',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Iniciar sesión</h1>
        <p className="auth_form_intro">Accede con tu correo y contraseña.</p>

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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="auth_form_error">{error}</p> : null}

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </div>

        <div className="auth_form_links">
          <a href="/auth/register">Crear cuenta</a>
          <a href="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    </div>
  );
}
