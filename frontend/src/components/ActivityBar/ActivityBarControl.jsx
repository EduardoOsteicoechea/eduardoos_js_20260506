import { LinkedInIcon, WhatsAppIcon } from '../ActivityBarSocialIcons';
import { ChatbotToggleButton } from '../Chatbot';
import EditorActionButton from '../EditorActionButton';
import { SiteMenu } from '../SiteMenu';
import { LINKEDIN_URL, WHATSAPP_URL } from '../../lib/contactLinks';
import { renderEditorActionIcon } from './ActivityBarEditorIcons';

const controlBtn =
  'theme-toolbar-btn activity-bar-control shrink-0 p-0';

const socialBtn = `${controlBtn} activity-bar-social-btn`;

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
    const className = `${controlBtn} flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50`;

    return (
      <EditorActionButton
        key={editorAction.id}
        variant={isSave ? 'success' : undefined}
        onClick={editorAction.onClick}
        disabled={Boolean(editorAction.disabled)}
        className={className}
        title={editorAction.title}
        aria-label={editorAction.title}
      >
        {renderEditorActionIcon(editorAction.icon ?? editorAction.label)}
      </EditorActionButton>
    );
  }

  switch (controlId) {
    case 'scroll-up':
      return (
        <EditorActionButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`${controlBtn} flex items-center justify-center`}
          title="Ir al inicio"
          aria-label="Ir al inicio"
        >
          ↑
        </EditorActionButton>
      );

    case 'scroll-down':
      return (
        <EditorActionButton
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth',
            })
          }
          className={`${controlBtn} flex items-center justify-center`}
          title="Ir al final"
          aria-label="Ir al final"
        >
          ↓
        </EditorActionButton>
      );

    case 'whatsapp':
      return (
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={socialBtn}
          aria-label="WhatsApp +584147281033"
          title="WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      );

    case 'linkedin':
      return (
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={socialBtn}
          aria-label="LinkedIn Eduardo Osteicoechea"
          title="LinkedIn"
        >
          <LinkedInIcon />
        </a>
      );

    case 'chatbot':
      return <ChatbotToggleButton className="activity-bar-control" />;

    case 'site-menu':
      if (!menuPrefs?.ready) {
        return (
          <span
            className="theme-muted inline-block activity-bar-control"
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
