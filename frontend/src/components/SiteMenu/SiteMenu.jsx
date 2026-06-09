import { useState } from "react";
import MenuButton from "./MenuButton";
import MenuTray from "./MenuTray";
import getRoutes from "./routes";

export default function SiteMenu() {
  
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  const toggleTray = () => {
    console.log("oo")
    setIsTrayOpen((prev) => !prev);
  };

  return (
    <>
      <MenuTray isTrayOpen={isTrayOpen} getRoutes={getRoutes} />
      <MenuButton isTrayOpen={isTrayOpen} onToggle={toggleTray} />
    </>
  );
}