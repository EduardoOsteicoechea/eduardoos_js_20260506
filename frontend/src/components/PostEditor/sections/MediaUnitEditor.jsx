import { useRef, useState } from 'react';
import { uploadMedia, listMedia } from '../../../lib/mediaApi';
import { resolveMediaUrl } from '../../../lib/mediaUrl';
import { inputClassName } from './editorInputStyles';

const MEDIA_LABEL_BY_TYPE = {
  image: 'Imagen',
  video: 'Video',
  audio: 'Audio',
};

export default function MediaUnitEditor({ type, draft, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryObjects, setLibraryObjects] = useState([]);

  const previewSrc = resolveMediaUrl(draft.src);

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadError('');
    setPreviewError(false);

    try {
      const result = await uploadMedia(file);
      const nextUrl = String(result.url ?? result.key ?? '').trim();
      onChange({
        ...draft,
        src: nextUrl.startsWith('/api/media/object')
          ? nextUrl
          : resolveMediaUrl(nextUrl),
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

  const handleUpload = async (file) => {
    if (!file) return;
    await uploadFile(file);
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLibraryLoading(true);
    try {
      const data = await listMedia();
      setLibraryObjects(Array.isArray(data.objects) ? data.objects : []);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'No se pudo cargar la biblioteca',
      );
    } finally {
      setLibraryLoading(false);
    }
  };

  const label = MEDIA_LABEL_BY_TYPE[type] ?? 'Media';

  return (
    <div className="post-editor-unit post-editor-unit--media">
      <label className="post-editor__label">{label}</label>

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
        onChange={(event) => handleUpload(event.target.files?.[0])}
        disabled={uploading}
      />

      <div className="post-editor-media-actions">
        <button
          type="button"
          className="ui-control"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo…' : 'Subir archivo'}
        </button>
        <button type="button" className="ui-control" onClick={openLibrary}>
          Biblioteca
        </button>
      </div>

      {uploadError ? <p className="post-editor__error">{uploadError}</p> : null}

      {previewSrc ? (
        <div className="post-editor-media-preview">
          {type === 'image' ? (
            <img
              src={previewSrc}
              alt={draft.name || label}
              onError={() => setPreviewError(true)}
            />
          ) : type === 'video' ? (
            <video src={previewSrc} controls onError={() => setPreviewError(true)} />
          ) : (
            <audio src={previewSrc} controls onError={() => setPreviewError(true)} />
          )}
          {previewError ? (
            <p className="post-editor__error">No se pudo previsualizar el archivo.</p>
          ) : null}
        </div>
      ) : null}

      <label className="post-editor__label">Nombre</label>
      <input
        className={inputClassName}
        type="text"
        value={draft.name ?? ''}
        onChange={(event) => onChange({ ...draft, name: event.target.value })}
      />

      {libraryOpen ? (
        <div className="post-editor-media-library">
          <div className="post-editor-media-library__header">
            <strong>Biblioteca</strong>
            <button
              type="button"
              className="ui-control"
              onClick={() => setLibraryOpen(false)}
            >
              Cerrar
            </button>
          </div>
          {libraryLoading ? (
            <p>Cargando…</p>
          ) : (
            <ul>
              {libraryObjects.map((object) => (
                <li key={object.key}>
                  <button
                    type="button"
                    className="ui-control"
                    onClick={() => {
                      onChange({
                        ...draft,
                        src: resolveMediaUrl(object.url ?? object.key),
                        name: object.name ?? object.key,
                      });
                      setLibraryOpen(false);
                    }}
                  >
                    {object.name ?? object.key}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
