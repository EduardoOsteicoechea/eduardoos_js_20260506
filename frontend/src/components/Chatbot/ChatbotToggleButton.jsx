import { SiteControlButton } from '../ui';
import { useChatbot } from './useChatbot';

export default function ChatbotToggleButton({ className = '' }) {
  const { open, toggleTray } = useChatbot();

  return (
    <SiteControlButton
      size="bar"
      variant="framed"
      label="AI"
      active={open}
      onClick={toggleTray}
      className={`ui-control--bar-label ${className}`.trim()}
      aria-label={open ? 'Cerrar asistente AI' : 'Abrir asistente AI'}
      aria-expanded={open}
      title="Asistente AI"
    />
  );
}
