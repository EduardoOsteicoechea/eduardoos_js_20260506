import { useEffect, useMemo, useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import {
  getAuthUser,
  resendVerification,
  validateEmail,
} from '../../lib/auth/authStore';
import './AuthForm.css';

export default function ValidateEmailForm() {
  const tokenFromUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') ?? '';
  }, []);

  const registered = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('registered') === '1';
  }, []);

  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(() => getAuthUser()?.email ?? '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    registered ? 'Cuenta creada. Revisa tu correo o pega el token aquí.' : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) return;

    let active = true;
    (async () => {
      setIsSubmitting(true);
      try {
        await validateEmail(tokenFromUrl);
        if (!active) return;
        setSuccess('Correo verificado correctamente.');
      } catch (submitError) {
        if (!active) return;
        setError(
          submitError instanceof Error
            ? submitError.message
            : 'No se pudo verificar el correo',
        );
      } finally {
        if (active) setIsSubmitting(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tokenFromUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await validateEmail(token);
      setSuccess('Correo verificado correctamente.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo verificar el correo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await resendVerification(email);
      setSuccess('Correo de verificación reenviado.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo reenviar el correo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Verificar correo</h1>
        <p className="auth_form_intro">
          Pega el token del correo o abre el enlace que te enviamos.
        </p>

        <label className="auth_form_field">
          <span className="auth_form_label">Token</span>
          <input
            className={UI_FIELD_CLASS}
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required={!tokenFromUrl}
          />
        </label>

        {error ? <p className="auth_form_error">{error}</p> : null}
        {success ? <p className="auth_form_success">{success}</p> : null}

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Verificando…' : 'Verificar'}
          </button>
        </div>
      </form>

      <form className="auth_form_card" onSubmit={(event) => event.preventDefault()}>
        <h2 className="auth_form_title">Reenviar correo</h2>
        <label className="auth_form_field">
          <span className="auth_form_label">Correo</span>
          <input
            className={UI_FIELD_CLASS}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <div className="auth_form_actions">
          <button
            type="button"
            className="ui-control"
            disabled={isSubmitting}
            onClick={handleResend}
          >
            Reenviar
          </button>
        </div>
      </form>
    </div>
  );
}
