import EditorActionButton from '../EditorActionButton';
import { renderEditorActionIcon } from '../ActivityBar/ActivityBarEditorIcons';
import './PageActionToolbar.css';

/**
 * @typedef {import('../ActivityBar/ActivityBarControl').ActivityBarEditorAction} PageAction
 */

/**
 * @param {PageAction} action
 */
function actionButtonLabel(action) {
  if (action.label) return action.label;
  if (action.icon === 'save') return 'Guardar';
  if (action.icon === 'print') return 'PDF';
  if (action.icon === 'eye') return 'Vista previa';
  return action.title;
}

/**
 * @param {{
 *   actions: PageAction[],
 *   className?: string,
 *   ariaLabel?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function PageActionToolbar({
  actions,
  className = '',
  ariaLabel = 'Acciones de página',
  children,
}) {
  if (!actions?.length && !children) return null;

  return (
    <div
      className={`page_action_toolbar ${className}`.trim()}
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div className="page_action_toolbar__actions">
        {actions.map((action) => {
          const isSave = action.icon === 'save' || action.id === 'save';
          const hasIcon = Boolean(action.icon);

          return (
            <EditorActionButton
              key={action.id}
              variant={isSave ? 'success' : 'default'}
              active={Boolean(action.active)}
              onClick={action.onClick}
              disabled={Boolean(action.disabled)}
              title={action.title}
              aria-label={action.title}
              icon={hasIcon ? renderEditorActionIcon(action.icon) : undefined}
              label={actionButtonLabel(action)}
            />
          );
        })}
      </div>
      {children ? (
        <div className="page_action_toolbar__extra">{children}</div>
      ) : null}
    </div>
  );
}
