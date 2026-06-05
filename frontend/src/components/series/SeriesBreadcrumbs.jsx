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
    <nav className="series-breadcrumbs" aria-label="Breadcrumb">
      <ol className="series-breadcrumbs__list">
        {displayCrumbs.map((crumb) => (
          <li key={crumb.href} className="series-breadcrumbs__item">
            <a href={crumb.href} className="series-breadcrumbs__link">
              {crumb.label}
            </a>
            <span className="theme-muted" aria-hidden="true">
              /
            </span>
          </li>
        ))}
        <li className="series-breadcrumbs__current" aria-current="page">
          {currentLabel}
        </li>
      </ol>
    </nav>
  );
}
