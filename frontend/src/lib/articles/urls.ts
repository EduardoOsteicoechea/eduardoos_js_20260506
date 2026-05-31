/** Public URL path for an article slug (e.g. romanos/pablo/origen). */
export function articlePath(slug: string): string {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return `/series/${normalized}`;
}
