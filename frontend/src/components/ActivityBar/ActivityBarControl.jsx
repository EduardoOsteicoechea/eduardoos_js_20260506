import { LinkedInIcon, WhatsAppIcon } from '../ActivityBarSocialIcons';
import ChatbotToggleButton from '../Chatbot/ChatbotToggleButton';
import { SiteLanguageButton } from '../SiteLanguage';
import { SiteControlButton } from '../ui';
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
 * @property {boolean} [active]
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
    const iconKey = editorAction.icon;
    const hasIconKey = Boolean(iconKey);
    const labelOnly = Boolean(editorAction.label) && !hasIconKey;

    return (
      <SiteControlButton
        size="bar"
        variant={isSave ? 'success' : 'default'}
        active={Boolean(editorAction.active)}
        onClick={editorAction.onClick}
        disabled={Boolean(editorAction.disabled)}
        title={editorAction.title}
        aria-label={editorAction.title}
        label={labelOnly ? editorAction.label : undefined}
        icon={
          hasIconKey
            ? renderEditorActionIcon(iconKey)
            : labelOnly
              ? undefined
              : renderEditorActionIcon(editorAction.label)
        }
        iconClassName={hasIconKey ? 'ui-control__icon--compact' : ''}
      />
    );
  }

  switch (controlId) {
    case 'site-language':
      return <SiteLanguageButton />;

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

    default:
      return null;
  }
}
