/**
 * @param {string} segment
 */
export function formatSegmentLabel(segment) {
  return segment
    .split(/[_-]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
