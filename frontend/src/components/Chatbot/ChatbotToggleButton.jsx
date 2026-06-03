import { useChatbot } from './useChatbot';

export default function ChatbotToggleButton({ className = '' }) {
  const { open, toggleTray } = useChatbot();

  return (
    <button
      type="button"
      onClick={toggleTray}
      className={`theme-toolbar-btn shrink-0 px-2 text-xs font-bold tracking-wide ${open ? 'ring-2 ring-black dark:ring-white' : ''} ${className}`.trim()}
      aria-label={open ? 'Cerrar asistente AI' : 'Abrir asistente AI'}
      aria-expanded={open}
      title="Asistente AI"
    >
      AI
    </button>
  );
}
