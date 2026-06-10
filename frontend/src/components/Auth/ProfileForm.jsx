import { useEffect, useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import {
  ensureAuthBootstrapped,
  fetchProfile,
  getAuthUser,
  logout,
  updateProfile,
} from '../../lib/auth/authStore';
import './AuthForm.css';

export default function ProfileForm() {
  const [user, setUser] = useState(() => getAuthUser());
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const bootstrapped = await ensureAuthBootstrapped();
        if (!bootstrapped) {
          window.location.href = '/auth/login?next=/auth/profile';
          return;
        }
        const profile = await fetchProfile();
        if (!active) return;
        setUser(profile);
        setDisplayName(profile.display_name ?? '');
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar el perfil',
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updated = await updateProfile({
        display_name: displayName,
        password: password || undefined,
      });
      setUser(updated);
      setPassword('');
      setSuccess('Perfil actualizado.');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo actualizar el perfil',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (isLoading) {
    return <div className="auth_form_page">Cargando perfil…</div>;
  }

  return (
    <div className="auth_form_page">
      <form className="auth_form_card" onSubmit={handleSubmit}>
        <h1 className="auth_form_title">Perfil</h1>
        <p className="auth_form_intro">
          {user?.email}
          {user?.email_verified ? '' : ' — correo sin verificar'}
        </p>
        <p className="auth_form_intro">Roles: {(user?.roles ?? []).join(', ')}</p>

        <label className="auth_form_field">
          <span className="auth_form_label">Nombre</span>
          <input
            className={UI_FIELD_CLASS}
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>

        <label className="auth_form_field">
          <span className="auth_form_label">Nueva contraseña</span>
          <input
            className={UI_FIELD_CLASS}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Opcional"
          />
        </label>

        {error ? <p className="auth_form_error">{error}</p> : null}
        {success ? <p className="auth_form_success">{success}</p> : null}

        <div className="auth_form_actions">
          <button type="submit" className="ui-control" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="ui-control"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>

        {!user?.email_verified ? (
          <div className="auth_form_links">
            <a href="/auth/validate-email">Verificar correo</a>
          </div>
        ) : null}
      </form>
    </div>
  );
}
