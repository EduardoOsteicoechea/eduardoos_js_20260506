import { SiteControlButton } from '../ui';
import { useChatbot } from './useChatbot';

export default function ChatbotToggleButton({ className = '' }) {
  const { open, toggleTray } = useChatbot();

  return (
    <SiteControlButton
      size="bar"
      label="AI"
      active={open}
      onClick={toggleTray}
      className={`font-bold tracking-wide ${className}`.trim()}
      aria-label={open ? 'Cerrar asistente AI' : 'Abrir asistente AI'}
      aria-expanded={open}
      title="Asistente AI"
    />
  );
}
