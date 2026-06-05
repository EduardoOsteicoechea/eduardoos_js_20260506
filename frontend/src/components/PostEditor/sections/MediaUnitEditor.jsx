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
    <div className="media-unit-editor">
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
        <p className="post-editor__hint theme-muted">
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
          className="media-unit-editor__preview-image"
        />
      ) : null}

      {type === 'video' && previewSrc ? (
        <video
          src={previewSrc}
          controls
          className="media-unit-editor__preview-video"
        />
      ) : null}

      {type === 'audio' && previewSrc ? (
        <audio src={previewSrc} controls className="media-unit-editor__preview-audio" />
      ) : null}
    </div>
  );
}
