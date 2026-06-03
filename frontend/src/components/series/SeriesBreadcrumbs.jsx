import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

/**
 * @param {{ crumbs: { href: string, label: string, labelKey?: string }[], currentLabel: string }} props
 */
export default function SeriesBreadcrumbs({ crumbs, currentLabel }) {
  const lang = useSiteLanguage();

  const displayCrumbs = crumbs.map((crumb) => {
    if (crumb.labelKey === 'posts' || crumb.href === '/series') {
      return { ...crumb, label: getSiteLabel('posts', lang) };
    }
    return crumb;
  });

  return (
    <nav className="mb-8 text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {displayCrumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <a
              href={crumb.href}
              className="font-medium underline opacity-80 hover:opacity-100"
            >
              {crumb.label}
            </a>
            <span className="theme-muted" aria-hidden="true">
              /
            </span>
          </li>
        ))}
        <li className="font-medium" aria-current="page">
          {currentLabel}
        </li>
      </ol>
    </nav>
  );
}
