import { useState } from "react";
import MenuButton from "./MenuButton";
import MenuTray from "./MenuTray";
import getRoutes from "./routes";
import "./Header.css";

export default function Header() {
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  const toggleTray = () => {
    setIsTrayOpen((prev) => !prev);
  };

  return (
    <div className="header">
      <MenuTray isTrayOpen={isTrayOpen} getRoutes={getRoutes} />
      <MenuButton isTrayOpen={isTrayOpen} onToggle={toggleTray} />
    </div>
  );
}