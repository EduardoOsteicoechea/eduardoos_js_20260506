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
      <div className="activity-bar__primary">
        <ActivityBarControl controlId="site-language" menuPrefs={menuPrefs} />
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

      <div className="activity-bar__secondary">
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
