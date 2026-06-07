import { useCallback, useEffect, useMemo, useState } from 'react';
import { listMedia } from '../../lib/mediaApi';
import './S3MediaBrowser.css';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function isImageType(contentType, name) {
  const type = String(contentType ?? '').toLowerCase();
  if (type.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(String(name ?? ''));
}

function splitPrefix(prefix) {
  const clean = String(prefix ?? '').trim().replace(/^\/+/, '');
  if (!clean) return [];
  return clean.split('/').filter(Boolean);
}

function parentPrefix(prefix) {
  const parts = splitPrefix(prefix);
  if (parts.length === 0) return '';
  return `${parts.slice(0, -1).join('/')}/`;
}

export default function S3MediaBrowser() {
  const [prefix, setPrefix] = useState('');
  const [folders, setFolders] = useState([]);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewKey, setPreviewKey] = useState('');

  const crumbs = useMemo(() => {
    const parts = splitPrefix(prefix);
    const items = [{ label: 'media', prefix: '' }];
    let current = '';
    for (const part of parts) {
      current = current ? `${current}${part}/` : `${part}/`;
      items.push({ label: part, prefix: current });
    }
    return items;
  }, [prefix]);

  const load = useCallback(async (nextPrefix = prefix) => {
    setLoading(true);
    setError('');
    try {
      const data = await listMedia(nextPrefix);
      setPrefix(String(data.prefix ?? nextPrefix ?? ''));
      setFolders(Array.isArray(data.folders) ? data.folders : []);
      setObjects(Array.isArray(data.objects) ? data.objects : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Error de red');
      setFolders([]);
      setObjects([]);
    } finally {
      setLoading(false);
    }
  }, [prefix]);

  useEffect(() => {
    load(prefix);
  }, []);

  const previewObject = objects.find((item) => item.key === previewKey) ?? null;

  return (
    <div className="s3-media-browser">
      <div className="s3-media-browser__header">
        <div>
          <h1 className="s3-media-browser__title">Media S3</h1>
          <p className="s3-media-browser__subtitle theme-muted">
            Explorador del bucket privado servido vía backend.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(prefix)}
          disabled={loading}
          className="theme-toolbar-btn s3-media-browser__refresh"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <nav className="s3-media-browser__crumbs theme-border" aria-label="Ruta">
        {crumbs.map((crumb, index) => (
          <span key={crumb.prefix || 'root'} className="s3-media-browser__crumb">
            {index > 0 ? <span className="s3-media-browser__crumb-sep">/</span> : null}
            <button
              type="button"
              className="s3-media-browser__crumb-btn"
              onClick={() => {
                setPreviewKey('');
                setPrefix(crumb.prefix);
                load(crumb.prefix);
              }}
            >
              {crumb.label}
            </button>
          </span>
        ))}
      </nav>

      {prefix ? (
        <button
          type="button"
          className="theme-toolbar-btn s3-media-browser__up"
          onClick={() => {
            const parent = parentPrefix(prefix);
            setPreviewKey('');
            setPrefix(parent);
            load(parent);
          }}
        >
          Subir a {parentPrefix(prefix) || 'media'}
        </button>
      ) : null}

      {error ? <p className="s3-media-browser__error">{error}</p> : null}

      <div className="s3-media-browser__layout">
        <section className="s3-media-browser__panel theme-border">
          <h2 className="s3-media-browser__panel-title">Carpetas</h2>
          {folders.length === 0 ? (
            <p className="theme-muted">Sin subcarpetas</p>
          ) : (
            <ul className="s3-media-browser__list">
              {folders.map((folder) => (
                <li key={folder.prefix}>
                  <button
                    type="button"
                    className="s3-media-browser__folder-btn"
                    onClick={() => {
                      setPreviewKey('');
                      setPrefix(folder.prefix);
                      load(folder.prefix);
                    }}
                  >
                    {folder.name}/
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="s3-media-browser__panel theme-border">
          <h2 className="s3-media-browser__panel-title">Archivos</h2>
          {objects.length === 0 ? (
            <p className="theme-muted">{loading ? 'Cargando…' : 'Sin archivos en esta carpeta'}</p>
          ) : (
            <ul className="s3-media-browser__list s3-media-browser__list--objects">
              {objects.map((object) => (
                <li key={object.key} className="s3-media-browser__object">
                  <button
                    type="button"
                    className="s3-media-browser__object-btn"
                    onClick={() => setPreviewKey(object.key)}
                  >
                    <span className="s3-media-browser__object-name">{object.name}</span>
                    <span className="s3-media-browser__object-meta theme-muted">
                      {formatBytes(object.size)}
                      {object.last_modified ? ` · ${object.last_modified}` : ''}
                    </span>
                  </button>
                  <a
                    href={object.url}
                    target="_blank"
                    rel="noreferrer"
                    className="s3-media-browser__open-link"
                  >
                    Abrir
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="s3-media-browser__preview theme-border">
          <h2 className="s3-media-browser__panel-title">Vista previa</h2>
          {!previewObject ? (
            <p className="theme-muted">Selecciona un archivo para previsualizarlo.</p>
          ) : (
            <div className="s3-media-browser__preview-body">
              <p className="s3-media-browser__preview-key theme-muted">{previewObject.key}</p>
              {isImageType(previewObject.content_type, previewObject.name) ? (
                <img
                  src={previewObject.url}
                  alt={previewObject.name}
                  className="s3-media-browser__preview-image"
                />
              ) : (
                <p className="theme-muted">
                  Vista previa no disponible.{' '}
                  <a href={previewObject.url} target="_blank" rel="noreferrer">
                    Abrir archivo
                  </a>
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
