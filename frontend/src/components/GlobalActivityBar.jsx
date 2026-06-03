import { ChatbotToggleButton } from './Chatbot';
import EditorActionButton from './EditorActionButton';
import { SiteMenu } from './SiteMenu';
import { useSiteReadingPreferences } from '../hooks/useSiteReadingPreferences';

export default function GlobalActivityBar() {
  const prefs = useSiteReadingPreferences();

  return (
    <footer
      className="theme-border theme-surface global-activity-bar fixed bottom-0 left-0 right-0 z-[220] flex h-[45px] border-t"
      role="toolbar"
      aria-label="Controles globales"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-3 sm:gap-3 sm:px-4">
        <EditorActionButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex h-8 w-8 shrink-0 items-center justify-center p-0"
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
          className="flex h-8 w-8 shrink-0 items-center justify-center p-0"
          title="Ir al final"
          aria-label="Ir al final"
        >
          ↓
        </EditorActionButton>
      </div>

      <div className="theme-border flex shrink-0 items-center gap-2 border-l px-2 sm:gap-3 sm:px-3">
        <ChatbotToggleButton />
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
          <span className="theme-muted inline-block h-8 w-8" aria-hidden="true" />
        )}
      </div>
    </footer>
  );
}
