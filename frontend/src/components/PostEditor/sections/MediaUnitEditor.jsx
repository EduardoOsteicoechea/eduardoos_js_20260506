import { useRef, useState } from 'react';
import { uploadMedia, listMedia } from '../../../lib/mediaApi';
import { resolveMediaUrl } from '../../../lib/mediaUrl';
import { inputClassName } from './editorInputStyles';

const MEDIA_LABEL_BY_TYPE = {
  image: 'Imagen',
  video: 'Video',
  audio: 'Audio',
};

export default function MediaUnitEditor({
  type,
  draft,
  onChange,
  uploadPrefix = '',
  editorPassword = '',
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryObjects, setLibraryObjects] = useState([]);

  const previewSrc = resolveMediaUrl(draft.src);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!editorPassword.trim()) {
      setUploadError('Guarda el artículo una vez con tu contraseña para habilitar subidas a S3.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const result = await uploadMedia(file, {
        prefix: uploadPrefix,
        password: editorPassword,
      });
      onChange({
        ...draft,
        src: result.url,
        name: draft.name?.trim() ? draft.name : file.name,
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'No se pudo subir el archivo',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadLibrary = async () => {
    setLibraryOpen(true);
    setLibraryLoading(true);
    setUploadError('');

    try {
      const result = await listMedia(uploadPrefix);
      setLibraryObjects(result.objects ?? []);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'No se pudo cargar la biblioteca S3',
      );
      setLibraryObjects([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  return (
    <div className="media-unit-editor">
      <div className="media-unit-editor__toolbar">
        <button
          type="button"
          className="theme-toolbar-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo…' : 'Subir a S3'}
        </button>
        <button
          type="button"
          className="theme-toolbar-btn"
          onClick={loadLibrary}
          disabled={libraryLoading}
        >
          {libraryLoading ? 'Cargando…' : 'Biblioteca S3'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={
            type === 'image'
              ? 'image/*'
              : type === 'video'
                ? 'video/*'
                : 'audio/*'
          }
          hidden
          onChange={(event) => handleUpload(event.target.files?.[0])}
        />
      </div>

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

      {uploadError ? (
        <p className="media-unit-editor__error theme-muted">{uploadError}</p>
      ) : null}

      {libraryOpen ? (
        <ul className="media-unit-editor__library">
          {libraryObjects.length === 0 ? (
            <li className="theme-muted">No hay archivos en esta carpeta.</li>
          ) : (
            libraryObjects.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="media-unit-editor__library-item"
                  onClick={() => {
                    onChange({
                      ...draft,
                      src: item.url,
                      name: draft.name?.trim() ? draft.name : item.name,
                    });
                    setLibraryOpen(false);
                  }}
                >
                  {item.name}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {type === 'image' && previewSrc ? (
        <div className="media-unit-editor__preview-frame">
          <img
            src={previewSrc}
            alt={draft.label || draft.name || 'Vista previa'}
            className="media-unit-editor__preview-image"
          />
        </div>
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
