import { LinkedInIcon, WhatsAppIcon } from './ActivityBarSocialIcons';
import { ChatbotToggleButton } from './Chatbot';
import EditorActionButton from './EditorActionButton';
import { SiteMenu } from './SiteMenu';
import { useSiteReadingPreferences } from '../hooks/useSiteReadingPreferences';
import { LINKEDIN_URL, WHATSAPP_URL } from '../lib/contactLinks';

const controlBtn =
  'theme-toolbar-btn activity-bar-control shrink-0 p-0';

const socialBtn = `${controlBtn} activity-bar-social-btn`;

export default function GlobalActivityBar() {
  const prefs = useSiteReadingPreferences();

  return (
    <footer
      className="theme-border theme-surface global-activity-bar relative z-[20] flex h-[var(--activity-bar-height)] w-full shrink-0 border-t"
      role="toolbar"
      aria-label="Controles globales"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-3 sm:gap-3 sm:px-4">
        <EditorActionButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`${controlBtn} flex items-center justify-center`}
          title="Ir al inicio"
          aria-label="Ir al inicio"
        >
          ↑
        </EditorActionButton>

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
      </div>

      <div className="theme-border flex shrink-0 items-center gap-2 border-l px-2 sm:gap-3 sm:px-3">
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

        <ChatbotToggleButton className="activity-bar-control" />
        {prefs.ready ? (
          <SiteMenu
            theme={prefs.theme}
            fontFamilyId={prefs.fontFamilyId}
            baseFontSize={prefs.baseFontSize}
            onToggleTheme={prefs.onToggleTheme}
            onIncreaseFont={prefs.onIncreaseFont}
            onDecreaseFont={prefs.onDecreaseFont}
            onSelectFont={prefs.onSelectFont}
          />
        ) : (
          <span
            className="theme-muted inline-block activity-bar-control"
            aria-hidden="true"
          />
        )}
      </div>
    </footer>
  );
}
