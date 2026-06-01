import { useEffect, useState } from 'react';
import { inputClassName, labelClassName } from './editorInputStyles';

const ACCEPT_BY_TYPE = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
};

const UPLOAD_LABEL_BY_TYPE = {
  image: 'Imagen',
  video: 'Video',
  audio: 'Audio',
};

function resolvePreviewSrc(savedSrc, previewUrl) {
  if (previewUrl) return previewUrl;
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

export default function MediaUnitEditor({
  type,
  draft,
  pendingFile,
  onPendingFileChange,
  onChange,
}) {
  const [previewUrl, setPreviewUrl] = useState('');
  const previewSrc = resolvePreviewSrc(draft.src, previewUrl);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl('');
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [pendingFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onPendingFileChange(file);
    onChange({
      ...draft,
      fileName: file.name,
    });
  };

  const clearFile = () => {
    onPendingFileChange(null);
    onChange({
      ...draft,
      fileName: '',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClassName} htmlFor={`${type}-file`}>
          1. Archivo ({UPLOAD_LABEL_BY_TYPE[type]})
        </label>
        <input
          id={`${type}-file`}
          type="file"
          accept={ACCEPT_BY_TYPE[type]}
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-black/20 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold dark:file:border-white/20 dark:file:bg-black"
        />
        {draft.fileName || pendingFile ? (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <p className="theme-muted">
              Archivo seleccionado:{' '}
              <span className="font-medium text-black dark:text-white">
                {draft.fileName || pendingFile?.name}
              </span>
            </p>
            <button
              type="button"
              onClick={clearFile}
              className="theme-toolbar-btn text-xs"
            >
              Quitar archivo
            </button>
          </div>
        ) : (
          <p className="theme-muted mt-1 text-xs">
            La ruta del recurso la asignará el servidor al guardar el artículo.
          </p>
        )}
        {draft.src && !pendingFile ? (
          <p className="theme-muted mt-1 text-xs">
            Recurso publicado: <code className="text-[11px]">{draft.src}</code>
          </p>
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor={`${type}-label`}>
          2. Etiqueta del recurso
        </label>
        <input
          id={`${type}-label`}
          type="text"
          value={draft.label ?? ''}
          onChange={(event) => onChange({ ...draft, label: event.target.value })}
          placeholder="Texto descriptivo o título accesible"
          className={inputClassName}
        />
      </div>

      {type === 'image' && previewSrc ? (
        <img
          src={previewSrc}
          alt={draft.label || draft.fileName || 'Vista previa'}
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
