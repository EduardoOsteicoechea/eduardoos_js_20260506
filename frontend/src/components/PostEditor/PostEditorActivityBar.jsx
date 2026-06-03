import { ChatbotToggleButton } from '../Chatbot';
import { SiteMenu } from '../SiteMenu';
import EditorActionButton from '../EditorActionButton';
import { useSiteReadingPreferences } from '../../hooks/useSiteReadingPreferences';

function SaveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 4h13l3 3v13H4z" />
      <path d="M8 4v6h8V4" />
      <path d="M8 20v-6h8v6" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function renderActionIcon(icon) {
  if (icon === 'save') return <SaveIcon />;
  if (icon === 'print') return <PrintIcon />;
  if (icon === 'eye') return <EyeIcon />;
  return icon;
}

function getActionButtonClassName(action) {
  const baseClassName =
    'flex h-8 w-8 shrink-0 items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50';

  if (action.icon === 'save' || action.id === 'save') {
    return `${baseClassName}`;
  }

  return baseClassName;
}

export default function PostEditorActivityBar({ actions }) {
  const prefs = useSiteReadingPreferences();

  return (
    <footer
      className="theme-border theme-surface fixed bottom-0 left-0 right-0 z-[55] flex h-[45px] border-t"
      role="toolbar"
      aria-label="Controles del editor de artículos"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-3 sm:gap-3 sm:px-4">
        {actions.map((action) => {
          const isSave = action.icon === 'save' || action.id === 'save';

          if (isSave) {
            return (
              <EditorActionButton
                key={action.id}
                variant="success"
                onClick={action.onClick}
                disabled={Boolean(action.disabled)}
                className={getActionButtonClassName(action)}
                title={action.title}
                aria-label={action.title}
              >
                {renderActionIcon(action.icon ?? action.label)}
              </EditorActionButton>
            );
          }

          return (
            <EditorActionButton
              key={action.id}
              onClick={action.onClick}
              disabled={Boolean(action.disabled)}
              className={getActionButtonClassName(action)}
              title={action.title}
              aria-label={action.title}
            >
              {renderActionIcon(action.icon ?? action.label)}
            </EditorActionButton>
          );
        })}
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
