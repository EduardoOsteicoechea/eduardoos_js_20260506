import { useRef, useState } from 'react';
import { uploadMedia, listMedia } from '../../../lib/mediaApi';
import { resolveMediaUrl } from '../../../lib/mediaUrl';
import { validateEditorPassword } from '../postEditorApi';
import SavePasswordModal from '../SavePasswordModal';
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
  onRememberPassword,
}) {
  const fileInputRef = useRef(null);
  const pendingFileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryObjects, setLibraryObjects] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const previewSrc = resolveMediaUrl(draft.src);

  const uploadFile = async (file, password) => {
    setUploading(true);
    setUploadError('');
    setPreviewError(false);

    try {
      const result = await uploadMedia(file, {
        prefix: uploadPrefix,
        password,
      });
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

    if (!uploadPrefix.trim()) {
      setUploadError(
        'Completa serie, sección y nombre de carpeta en el editor del artículo antes de subir.',
      );
      return;
    }

    const password = String(editorPassword ?? '').trim();
    if (!password) {
      pendingFileRef.current = file;
      setPasswordModalError('');
      setPasswordModalOpen(true);
      return;
    }

    await uploadFile(file, password);
  };

  const handlePasswordConfirm = async (password) => {
    setPasswordSubmitting(true);
    setPasswordModalError('');

    try {
      const auth = await validateEditorPassword(password);
      if (!auth.response.ok || auth.data?.valid !== true) {
        setPasswordModalError(auth.data?.error ?? 'Contraseña incorrecta.');
        return;
      }

      onRememberPassword?.(password);
      setPasswordModalOpen(false);

      const pendingFile = pendingFileRef.current;
      pendingFileRef.current = null;
      if (pendingFile) {
        await uploadFile(pendingFile, password);
      }
    } catch {
      setPasswordModalError('Error de red al validar la contraseña.');
    } finally {
      setPasswordSubmitting(false);
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

      {uploadPrefix ? (
        <p className="media-unit-editor__prefix theme-muted">
          Carpeta S3: <code>{uploadPrefix}</code>
        </p>
      ) : (
        <p className="media-unit-editor__error">
          Define serie, sección y carpeta del artículo para subir archivos.
        </p>
      )}

      <input
        id={`${type}-url`}
        type="text"
        value={draft.src ?? ''}
        onChange={(event) => {
          setPreviewError(false);
          onChange({ ...draft, src: event.target.value });
        }}
        placeholder={`URL o ruta de ${MEDIA_LABEL_BY_TYPE[type].toLowerCase()}`}
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
        <p className="media-unit-editor__error" role="alert">
          {uploadError}
        </p>
      ) : null}

      {libraryOpen ? (
        <ul className="media-unit-editor__library">
          {libraryObjects.length === 0 ? (
            <li className="theme-muted">
              {uploadPrefix
                ? 'No hay archivos en esta carpeta.'
                : 'Selecciona una carpeta de artículo para ver su biblioteca.'}
            </li>
          ) : (
            libraryObjects.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="media-unit-editor__library-item"
                  onClick={() => {
                    setPreviewError(false);
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
          {previewError ? (
            <p className="media-unit-editor__preview-error theme-muted">
              No se pudo cargar la vista previa. Comprueba la URL o sube de nuevo.
            </p>
          ) : (
            <img
              src={previewSrc}
              alt={draft.label || draft.name || 'Vista previa'}
              className="media-unit-editor__preview-image"
              onError={() => setPreviewError(true)}
              onLoad={() => setPreviewError(false)}
            />
          )}
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

      <SavePasswordModal
        open={passwordModalOpen}
        isSubmitting={passwordSubmitting}
        error={passwordModalError}
        title="Contraseña para subir a S3"
        intro="Introduce la contraseña del editor para subir archivos al almacenamiento."
        submitLabel="Continuar"
        submittingLabel="Validando…"
        onClose={() => {
          if (!passwordSubmitting) {
            setPasswordModalOpen(false);
            pendingFileRef.current = null;
          }
        }}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
}
