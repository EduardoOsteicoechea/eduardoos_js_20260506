import EmphasizedTextPreview from './EmphasizedTextPreview';
import {
  normalizeListItems,
  normalizeUnitData,
  unitSupportsTextEmphasis,
} from './unitContentModel';

export function getUnitPreviewClassName(type) {
  switch (type) {
    case 'key_idea':
      return 'unit-preview__text--key-idea';
    case 'biblical_quote':
      return 'unit-preview__text--biblical';
    case 'paragraph':
      return 'unit-preview__text--paragraph';
    case 'list':
      return 'unit-preview__text--list';
    case 'link':
      return 'unit-preview__text--link';
    default:
      return 'unit-preview__text--muted theme-muted';
  }
}

function mediaPreviewSrc(src) {
  const value = String(src ?? '').trim();
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value;
  }
  return '';
}

export function UnitPreviewBody({ unit }) {
  const normalized = normalizeUnitData(unit);
  const previewClassName = getUnitPreviewClassName(unit.type);

  if (unitSupportsTextEmphasis(unit.type)) {
    return (
      <div className="unit-preview__stack">
        <p className={previewClassName}>
          <EmphasizedTextPreview
            content={normalized.content}
            emphasized={normalized.emphasized}
          />
        </p>
        {unit.type === 'biblical_quote' && normalized.reference ? (
          <p className="unit-preview__reference theme-muted">
            — {normalized.reference}
          </p>
        ) : null}
      </div>
    );
  }

  if (unit.type === 'list') {
    const items = normalizeListItems(normalized.list);
    const filled = items.filter((item) => String(item.content ?? '').trim());

    if (!filled.length) {
      return <p className="unit-preview__empty theme-muted">Lista vacía</p>;
    }

    return (
      <ul className={`unit-preview__list ${previewClassName}`}>
        {filled.map((item, index) => (
          <li key={index}>
            <EmphasizedTextPreview
              content={item.content}
              emphasized={item.emphasized}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (unit.type === 'image') {
    const src = mediaPreviewSrc(normalized.src);
    return (
      <figure className="unit-preview__media">
        {src ? (
          <img
            src={src}
            alt={normalized.label || normalized.name || ''}
            className="unit-preview__image"
          />
        ) : (
          <p className={`${previewClassName} unit-preview__text--italic`}>
            {normalized.name ? `Imagen: ${normalized.name}` : 'Imagen sin URL'}
          </p>
        )}
        {normalized.label ? (
          <figcaption className="unit-preview__caption theme-muted">
            {normalized.label}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (unit.type === 'video') {
    const src = mediaPreviewSrc(normalized.src);
    return (
      <figure className="unit-preview__media">
        {src ? (
          <video src={src} controls className="unit-preview__video" />
        ) : (
          <p className={`${previewClassName} unit-preview__text--italic`}>
            {normalized.name ? `Video: ${normalized.name}` : 'Video sin URL'}
          </p>
        )}
        {normalized.label ? (
          <figcaption className="unit-preview__caption theme-muted">
            {normalized.label}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (unit.type === 'audio') {
    const src = mediaPreviewSrc(normalized.src);
    return (
      <figure className="unit-preview__media">
        {src ? <audio src={src} controls className="unit-preview__audio" /> : null}
        <p className={previewClassName}>
          {normalized.label ||
            (normalized.name ? `Audio: ${normalized.name}` : 'Audio sin URL')}
        </p>
      </figure>
    );
  }

  if (unit.type === 'link') {
    const href = String(normalized.href ?? '').trim();
    const text = String(normalized.text ?? '').trim();
    if (!href) {
      return <p className="unit-preview__empty theme-muted">Enlace sin URL</p>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={previewClassName}
      >
        {text || href}
      </a>
    );
  }

  return (
    <p className="unit-preview__empty theme-muted">
      Configuración de esta unidad próximamente.
    </p>
  );
}
