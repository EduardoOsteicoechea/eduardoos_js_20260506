import EmphasizedTextPreview from './EmphasizedTextPreview';
import {
  normalizeListItems,
  normalizeUnitData,
  unitSupportsTextEmphasis,
} from './unitContentModel';

export function getUnitPreviewClassName(type) {
  switch (type) {
    case 'key_idea':
      return 'text-base font-semibold leading-snug';
    case 'biblical_quote':
      return 'text-sm italic leading-relaxed';
    case 'paragraph':
      return 'text-sm leading-relaxed';
    case 'list':
      return 'text-sm leading-relaxed';
    case 'link':
      return 'text-sm';
    default:
      return 'theme-muted text-sm';
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
      <div className="space-y-1">
        <p className={previewClassName}>
          <EmphasizedTextPreview
            content={normalized.content}
            emphasized={normalized.emphasized}
          />
        </p>
        {unit.type === 'biblical_quote' && normalized.reference ? (
          <p className="theme-muted text-xs font-semibold">— {normalized.reference}</p>
        ) : null}
      </div>
    );
  }

  if (unit.type === 'list') {
    const items = normalizeListItems(normalized.list);
    const filled = items.filter((item) => String(item.content ?? '').trim());

    if (!filled.length) {
      return <p className="theme-muted text-sm italic">Lista vacía</p>;
    }

    return (
      <ul className={`${previewClassName} list-disc space-y-1.5 pl-5`}>
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
      <figure className="space-y-1">
        {src ? (
          <img
            src={src}
            alt={normalized.label || normalized.fileName || ''}
            className="max-h-32 w-auto rounded"
          />
        ) : (
          <p className={`${previewClassName} italic`}>
            {normalized.fileName
              ? `Imagen: ${normalized.fileName}`
              : 'Imagen sin archivo'}
          </p>
        )}
        {normalized.label ? (
          <figcaption className="theme-muted text-xs">{normalized.label}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (unit.type === 'video') {
    const src = mediaPreviewSrc(normalized.src);
    return (
      <figure className="space-y-1">
        {src ? (
          <video src={src} controls className="max-h-32 w-full rounded" />
        ) : (
          <p className={`${previewClassName} italic`}>
            {normalized.fileName
              ? `Video: ${normalized.fileName}`
              : 'Video sin archivo'}
          </p>
        )}
        {normalized.label ? (
          <figcaption className="theme-muted text-xs">{normalized.label}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (unit.type === 'audio') {
    const src = mediaPreviewSrc(normalized.src);
    return (
      <figure className="space-y-1">
        {src ? <audio src={src} controls className="w-full" /> : null}
        <p className={previewClassName}>
          {normalized.label ||
            (normalized.fileName
              ? `Audio: ${normalized.fileName}`
              : 'Audio sin archivo')}
        </p>
      </figure>
    );
  }

  if (unit.type === 'link') {
    const href = String(normalized.href ?? '').trim();
    const text = String(normalized.text ?? '').trim();
    if (!href) {
      return <p className="theme-muted text-sm italic">Enlace sin URL</p>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${previewClassName} font-medium underline`}
      >
        {text || href}
      </a>
    );
  }

  return (
    <p className="theme-muted text-sm italic">
      Configuración de esta unidad próximamente.
    </p>
  );
}
