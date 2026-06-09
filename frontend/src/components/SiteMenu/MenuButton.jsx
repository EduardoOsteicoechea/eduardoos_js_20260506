import "./MenuButton.css"

export default function MenuButton({ isTrayOpen, onToggle }) {
  
  return (
      <div 
      className={`menu_button ${isTrayOpen ? "menu_button_opened_tray" : ""}`}
      onClick={onToggle}
      aria-expanded={isTrayOpen}
      aria-label="Toggle Menu"
      >
        <div className={`menu_button_bar menu_button_top_bar ${isTrayOpen ? "menu_button_top_bar_opened" : ""}`}></div>
        <div className={`menu_button_bar menu_button_bottom_bar ${isTrayOpen ? "menu_button_bottom_bar_opened" : ""}`}></div>
      </div>
  );
}