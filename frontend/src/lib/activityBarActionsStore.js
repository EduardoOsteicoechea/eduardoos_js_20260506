/** @typedef {import('../components/ActivityBar/ActivityBarControl').ActivityBarEditorAction} ActivityBarEditorAction */

/** @type {ActivityBarEditorAction[]} */
let leftActions = [];

/** @type {Set<() => void>} */
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * @param {ActivityBarEditorAction[]} actions
 */
export function setActivityBarLeftActions(actions) {
  leftActions = actions;
  emit();
}

export function clearActivityBarLeftActions() {
  setActivityBarLeftActions([]);
}

/**
 * @returns {ActivityBarEditorAction[]}
 */
export function getActivityBarLeftActions() {
  return leftActions;
}

/**
 * @param {() => void} listener
 * @returns {() => void}
 */
export function subscribeActivityBarLeftActions(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
