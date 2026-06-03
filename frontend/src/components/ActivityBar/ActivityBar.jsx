import { useMemo } from 'react';
import {
  getActivityBarLeftControls,
  resolveActivityBarLayout,
} from '../../config/activityBarConfig';
import { useSiteReadingPreferences } from '../../hooks/useSiteReadingPreferences';
import ActivityBarControl from './ActivityBarControl';

/**
 * @typedef {import('./ActivityBarControl').ActivityBarEditorAction} ActivityBarEditorAction
 */

/**
 * @param {{
 *   pathname: string,
 *   leftActions?: ActivityBarEditorAction[],
 *   className?: string,
 * }} props
 */
export default function ActivityBar({
  pathname,
  leftActions = [],
  className = '',
}) {
  const layout = useMemo(() => resolveActivityBarLayout(pathname), [pathname]);
  const menuPrefs = useSiteReadingPreferences();

  const builtinLeft = getActivityBarLeftControls(layout);
  const showEditorLeft = layout.leftFromProps && leftActions.length > 0;

  const footerClass = [
    'activity-bar',
    `activity-bar--${layout.variant}`,
    'theme-border',
    'theme-surface',
    'flex',
    'h-[var(--activity-bar-height)]',
    'w-full',
    'shrink-0',
    'border-t',
    layout.fixed
      ? 'fixed bottom-0 left-0 right-0'
      : 'relative z-[20]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const footerStyle = layout.zIndex ? { zIndex: layout.zIndex } : undefined;

  return (
    <footer
      className={footerClass}
      style={footerStyle}
      role="toolbar"
      aria-label={layout.ariaLabel}
      data-activity-bar-variant={layout.variant}
    >
      <div className="activity-bar__primary flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-3 sm:gap-3 sm:px-4">
        {showEditorLeft
          ? leftActions.map((action) => (
              <ActivityBarControl
                key={action.id}
                menuPrefs={menuPrefs}
                editorAction={action}
              />
            ))
          : builtinLeft.map((controlId) => (
              <ActivityBarControl
                key={controlId}
                controlId={controlId}
                menuPrefs={menuPrefs}
              />
            ))}
      </div>

      <div className="activity-bar__secondary theme-border flex shrink-0 items-center gap-2 border-l px-2 sm:gap-3 sm:px-3">
        {layout.right.map((controlId) => (
          <ActivityBarControl
            key={controlId}
            controlId={controlId}
            menuPrefs={menuPrefs}
          />
        ))}
      </div>
    </footer>
  );
}
