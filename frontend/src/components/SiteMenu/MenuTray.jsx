import "./MenuTray.css";

export default function MenuTray({ isTrayOpen, getRoutes }) {
  
  const routes = getRoutes(null);

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
      </nav>
    </div>
  );
}