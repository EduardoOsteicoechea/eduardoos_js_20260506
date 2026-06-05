import { inputClassName, labelClassName } from './editorInputStyles';

const MEDIA_LABEL_BY_TYPE = {
  image: 'Imagen',
  video: 'Video',
  audio: 'Audio',
};

function resolvePreviewSrc(savedSrc) {
  const value = String(savedSrc ?? '').trim();
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

export default function MediaUnitEditor({ type, draft, onChange }) {
  const previewSrc = resolvePreviewSrc(draft.src);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClassName} htmlFor={`${type}-url`}>
          1. URL del recurso ({MEDIA_LABEL_BY_TYPE[type]})
        </label>
        <input
          id={`${type}-url`}
          type="url"
          value={draft.src ?? ''}
          onChange={(event) => onChange({ ...draft, src: event.target.value })}
          placeholder="https://… o /data/series/…"
          className={inputClassName}
        />
        <p className="theme-muted mt-1 text-xs">
          Enlace público al archivo (no se sube el archivo al servidor).
        </p>
      </div>

      <div>
        <label className={labelClassName} htmlFor={`${type}-name`}>
          2. Nombre del recurso
        </label>
        <input
          id={`${type}-name`}
          type="text"
          value={draft.name ?? ''}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="Nombre descriptivo del archivo"
          className={inputClassName}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor={`${type}-label`}>
          3. Etiqueta accesible
        </label>
        <input
          id={`${type}-label`}
          type="text"
          value={draft.label ?? ''}
          onChange={(event) => onChange({ ...draft, label: event.target.value })}
          placeholder="Texto alternativo o título accesible"
          className={inputClassName}
        />
      </div>

      {type === 'image' && previewSrc ? (
        <img
          src={previewSrc}
          alt={draft.label || draft.name || 'Vista previa'}
          className="max-h-48 w-auto rounded-lg border border-black/10 dark:border-white/10"
        />
      ) : null}

      {type === 'video' && previewSrc ? (
        <video
          src={previewSrc}
          controls
          className="max-h-48 w-full rounded-lg border border-black/10 dark:border-white/10"
        />
      ) : null}

      {type === 'audio' && previewSrc ? (
        <audio src={previewSrc} controls className="w-full" />
      ) : null}
    </div>
  );
}
