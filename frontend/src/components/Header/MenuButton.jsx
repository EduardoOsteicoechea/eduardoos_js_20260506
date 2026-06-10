import "./MenuButton.css";

export default function MenuButton({ isTrayOpen, onToggle }) {
  return (
    <button
      type="button"
      className={`menu_button ${isTrayOpen ? "menu_button_opened_tray" : ""}`.trim()}
      onClick={onToggle}
      aria-expanded={isTrayOpen}
      aria-label="Toggle Menu"
    >
      <span
        className={`menu_button_bar menu_button_top_bar ${isTrayOpen ? "menu_button_top_bar_opened" : ""}`.trim()}
        aria-hidden="true"
      />
      <span
        className={`menu_button_bar menu_button_bottom_bar ${isTrayOpen ? "menu_button_bottom_bar_opened" : ""}`.trim()}
        aria-hidden="true"
      />
    </button>
  );
}
