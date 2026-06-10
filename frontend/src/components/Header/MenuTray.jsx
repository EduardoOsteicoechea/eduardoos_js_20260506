import { useEffect } from "react";
import { useAuth } from "../../lib/auth/useAuth";
import "./MenuTray.css";

export default function MenuTray({ isTrayOpen, getRoutes }) {
  const { user, authenticated, bootstrap } = useAuth();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const session = authenticated
    ? { isAuthenticated: true, roles: user?.roles ?? [] }
    : null;
  const routes = getRoutes(session);

  return (
    <div className={`menu_tray ${isTrayOpen ? "open_menu_tray" : ""}`.trim()}>
      <nav className="menu_tray_nav">
        {routes.map((route) => (
          <a
            key={route.url}
            href={route.url}
            className="menu_tray_nav_item"
            title={route.description}
          >
            {route.userFriendlyName}
          </a>
        ))}
        {authenticated ? (
          <a href="/auth/profile" className="menu_tray_nav_item" title="Perfil">
            Perfil ({user?.display_name || user?.email})
          </a>
        ) : (
          <a href="/auth/login" className="menu_tray_nav_item" title="Iniciar sesión">
            Iniciar sesión
          </a>
        )}
      </nav>
    </div>
  );
}