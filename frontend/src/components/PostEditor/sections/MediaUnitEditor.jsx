import { inputClassName } from './editorInputStyles';

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
      <input
        id={`${type}-url`}
        type="url"
        value={draft.src ?? ''}
        onChange={(event) => onChange({ ...draft, src: event.target.value })}
        placeholder={`URL de ${MEDIA_LABEL_BY_TYPE[type].toLowerCase()}`}
        aria-label={`URL de ${MEDIA_LABEL_BY_TYPE[type]}`}
        className={inputClassName}
      />

      <input
        id={`${type}-name`}
        type="text"
        value={draft.name ?? ''}
        onChange={(event) => onChange({ ...draft, name: event.target.value })}
        placeholder="Nombre del recurso"
        aria-label="Nombre del recurso"
        className={inputClassName}
      />

      <input
        id={`${type}-label`}
        type="text"
        value={draft.label ?? ''}
        onChange={(event) => onChange({ ...draft, label: event.target.value })}
        placeholder="Etiqueta accesible"
        aria-label="Etiqueta accesible"
        className={inputClassName}
      />

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
