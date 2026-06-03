import { useMemo, useSyncExternalStore } from 'react';
import {
  getActivityBarLeftControls,
  resolveActivityBarLayout,
} from '../../config/activityBarConfig';
import {
  getActivityBarLeftActions,
  subscribeActivityBarLeftActions,
} from '../../lib/activityBarActionsStore';
import { useSiteReadingPreferences } from '../../hooks/useSiteReadingPreferences';
import ActivityBarControl from './ActivityBarControl';

/**
 * @typedef {import('./ActivityBarControl').ActivityBarEditorAction} ActivityBarEditorAction
 */

/**
 * @param {{
 *   pathname: string,
 *   pageMode?: import('../../config/activityBarConfig').ActivityBarPageMode,
 *   leftActions?: ActivityBarEditorAction[],
 *   className?: string,
 * }} props
 */
export default function ActivityBar({
  pathname,
  pageMode = 'default',
  leftActions = [],
  className = '',
}) {
  const layout = useMemo(
    () => resolveActivityBarLayout(pathname, pageMode),
    [pathname, pageMode],
  );
  const menuPrefs = useSiteReadingPreferences();
  const storedLeftActions = useSyncExternalStore(
    subscribeActivityBarLeftActions,
    getActivityBarLeftActions,
    () => [],
  );

  const builtinLeft = getActivityBarLeftControls(layout);
  const dynamicLeftActions =
    leftActions.length > 0 ? leftActions : storedLeftActions;
  const showEditorLeft =
    layout.leftFromProps && dynamicLeftActions.length > 0;

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
          ? dynamicLeftActions.map((action) => (
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
