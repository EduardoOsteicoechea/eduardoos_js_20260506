import { useState } from "react";
import MenuButton from "./MenuButton";
import MenuTray from "./MenuTray";
import getRoutes from "./routes";
import "./SiteMenu.css";

export default function SiteMenu() {
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  const toggleTray = () => {
    setIsTrayOpen((prev) => !prev);
  };

  return (
    <div className="site_menu">
      <MenuTray isTrayOpen={isTrayOpen} getRoutes={getRoutes} />
      <MenuButton isTrayOpen={isTrayOpen} onToggle={toggleTray} />
    </div>
  );
}