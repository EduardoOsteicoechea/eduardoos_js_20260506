import { LinkedInIcon, WhatsAppIcon } from '../ActivityBarSocialIcons';
import ChatbotToggleButton from '../Chatbot/ChatbotToggleButton';
import { SiteControlButton } from '../ui';
import { SiteMenu } from '../SiteMenu';
import { LINKEDIN_URL, WHATSAPP_URL } from '../../lib/contactLinks';
import { renderEditorActionIcon } from './ActivityBarEditorIcons';

/**
 * @typedef {Object} ActivityBarEditorAction
 * @property {string} id
 * @property {string} [icon]
 * @property {string} [label]
 * @property {string} title
 * @property {() => void} onClick
 * @property {boolean} [disabled]
 */

/**
 * @param {{
 *   controlId?: import('../../config/activityBarConfig').ActivityBarControlId,
 *   menuPrefs: ReturnType<typeof import('../../hooks/useSiteReadingPreferences').useSiteReadingPreferences>,
 *   editorAction?: ActivityBarEditorAction,
 * }} props
 */
export default function ActivityBarControl({ controlId, menuPrefs, editorAction }) {
  if (editorAction) {
    const isSave = editorAction.icon === 'save' || editorAction.id === 'save';

    return (
      <SiteControlButton
        size="bar"
        variant={isSave ? 'success' : 'default'}
        onClick={editorAction.onClick}
        disabled={Boolean(editorAction.disabled)}
        title={editorAction.title}
        aria-label={editorAction.title}
        icon={renderEditorActionIcon(editorAction.icon ?? editorAction.label)}
      />
    );
  }

  switch (controlId) {
    case 'scroll-up':
      return (
        <SiteControlButton
          size="bar"
          label="↑"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Ir al inicio"
          aria-label="Ir al inicio"
        />
      );

    case 'scroll-down':
      return (
        <SiteControlButton
          size="bar"
          label="↓"
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth',
            })
          }
          title="Ir al final"
          aria-label="Ir al final"
        />
      );

    case 'whatsapp':
      return (
        <SiteControlButton
          as="a"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          size="bar"
          variant="ghost"
          icon={<WhatsAppIcon />}
          aria-label="WhatsApp +584147281033"
          title="WhatsApp"
        />
      );

    case 'linkedin':
      return (
        <SiteControlButton
          as="a"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          size="bar"
          variant="ghost"
          icon={<LinkedInIcon />}
          aria-label="LinkedIn Eduardo Osteicoechea"
          title="LinkedIn"
        />
      );

    case 'chatbot':
      return <ChatbotToggleButton />;

    case 'site-menu':
      if (!menuPrefs?.ready) {
        return (
          <span
            className="ui-control ui-control--bar ui-control--placeholder"
            aria-hidden="true"
          />
        );
      }
      return (
        <SiteMenu
          theme={menuPrefs.theme}
          fontFamilyId={menuPrefs.fontFamilyId}
          baseFontSize={menuPrefs.baseFontSize}
          onToggleTheme={menuPrefs.onToggleTheme}
          onIncreaseFont={menuPrefs.onIncreaseFont}
          onDecreaseFont={menuPrefs.onDecreaseFont}
          onSelectFont={menuPrefs.onSelectFont}
        />
      );

    default:
      return null;
  }
}
