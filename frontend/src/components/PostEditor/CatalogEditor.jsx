import { useCallback, useEffect, useMemo, useState } from 'react';
import EditorActionButton from '../EditorActionButton';
import EditorStatusNotice from '../EditorStatusNotice';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import CatalogSelect from './CatalogSelect';
import SavePasswordModal from './SavePasswordModal';
import {
  canEditChapter,
  getEffectiveChapter,
  getEffectiveSerie,
  mergeChapterOptions,
  mergeSeriesOptions,
} from './catalogHelpers';
import { validateEditorPassword } from './postEditorApi';
import { fetchSeriesCatalog } from './seriesCatalogApi';
import { fetchHubMetadata, saveCatalogMetadata } from './catalogEditorApi';

const inputClassName = UI_FIELD_CLASS;
const labelClassName = 'post-editor__label';

const EMPTY_HUB_FORM = {
  section: '',
  description: '',
  purpose: '',
  biblicalText: '',
  biblicalReference: '',
};

export default function CatalogEditor() {
  const [catalog, setCatalog] = useState({
    series: [],
    series_meta: {},
    chapters: {},
  });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [form, setForm] = useState({
    serie: '',
    serieIsCustom: false,
    serieCustom: '',
    chapter: '',
    chapterIsCustom: false,
    chapterCustom: '',
    seriesName: '',
  });
  const [hubForm, setHubForm] = useState(EMPTY_HUB_FORM);
  const [hubPosts, setHubPosts] = useState([]);
  const [hubLoading, setHubLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveSerie = useMemo(() => getEffectiveSerie(form), [form]);
  const effectiveChapter = useMemo(() => getEffectiveChapter(form), [form]);

  const seriesOptions = useMemo(
    () => mergeSeriesOptions(catalog, form),
    [catalog, form],
  );
  const chapterOptions = useMemo(
    () => mergeChapterOptions(catalog, form),
    [catalog, form],
  );

  const showNotice = useCallback((variant, message) => {
    if (!message?.trim()) {
      setNotice(null);
      return;
    }
    setNotice({ variant, message: message.trim() });
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    let cancelled = false;

    fetchSeriesCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((error) => {
        if (!cancelled) {
          showNotice(
            'error',
            error instanceof Error ? error.message : 'Error al cargar catálogo',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showNotice]);

  useEffect(() => {
    if (!effectiveSerie) {
      setForm((previous) => ({ ...previous, seriesName: '' }));
      return;
    }

    const metaName = catalog.series_meta?.[effectiveSerie]?.name ?? '';
    setForm((previous) => ({
      ...previous,
      seriesName: metaName || previous.seriesName || effectiveSerie,
    }));
  }, [catalog.series_meta, effectiveSerie]);

  useEffect(() => {
    if (!effectiveSerie || !effectiveChapter) {
      setHubForm(EMPTY_HUB_FORM);
      setHubPosts([]);
      return undefined;
    }

    let cancelled = false;
    setHubLoading(true);

    fetchHubMetadata(effectiveSerie, effectiveChapter)
      .then((hub) => {
        if (cancelled) return;
        const biblical = Array.isArray(hub.biblical_texts)
          ? hub.biblical_texts[0]
          : null;
        setHubForm({
          section: String(hub.section ?? ''),
          description: String(hub.description ?? ''),
          purpose: String(hub.purpose ?? ''),
          biblicalText: String(biblical?.text ?? ''),
          biblicalReference: String(biblical?.reference ?? ''),
        });
        setHubPosts(Array.isArray(hub.posts) ? hub.posts : []);
      })
      .catch((error) => {
        if (cancelled) return;
        setHubForm(EMPTY_HUB_FORM);
        setHubPosts([]);
        showNotice(
          'warning',
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el hub del capítulo',
        );
      })
      .finally(() => {
        if (!cancelled) setHubLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveChapter, effectiveSerie, showNotice]);

  const handleSerieExisting = (serie) => {
    setForm((previous) => ({
      ...previous,
      serie,
      serieIsCustom: false,
      serieCustom: '',
      chapter: catalog.chapters[serie]?.[0] ?? '',
      chapterIsCustom: !catalog.chapters[serie]?.length,
      chapterCustom: '',
    }));
  };

  const handleChapterExisting = (chapter) => {
    setForm((previous) => ({
      ...previous,
      chapter,
      chapterIsCustom: false,
      chapterCustom: '',
    }));
  };

  const openSaveModal = () => {
    clearNotice();
    if (!effectiveSerie) {
      showNotice('warning', 'Selecciona una serie.');
      return;
    }
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveWithPassword = async (password) => {
    setIsSubmitting(true);
    setModalError('');

    try {
      const auth = await validateEditorPassword(password);
      if (!auth.response.ok || auth.data?.valid !== true) {
        setModalError(auth.data?.error ?? 'Contraseña incorrecta.');
        return;
      }

      const hub =
        effectiveChapter && (hubForm.section || hubForm.description || hubForm.purpose)
          ? {
              series: effectiveSerie,
              section: hubForm.section.trim(),
              description: hubForm.description.trim(),
              purpose: hubForm.purpose.trim(),
              biblical_texts:
                hubForm.biblicalText.trim() || hubForm.biblicalReference.trim()
                  ? [
                      {
                        text: hubForm.biblicalText.trim(),
                        reference: hubForm.biblicalReference.trim(),
                      },
                    ]
                  : [],
              posts: hubPosts,
            }
          : undefined;

      const save = await saveCatalogMetadata(
        {
          series_slug: effectiveSerie,
          series_name: form.seriesName.trim() || effectiveSerie,
          chapter: effectiveChapter || undefined,
          hub,
        },
        password,
      );

      if (!save.response.ok) {
        setModalError(save.data?.error ?? 'No se pudo guardar el catálogo.');
        return;
      }

      setModalOpen(false);
      showNotice('success', 'Metadatos del catálogo guardados.');
      const refreshed = await fetchSeriesCatalog();
      setCatalog(refreshed);
    } catch (error) {
      setModalError('Error de red al contactar el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-editor catalog-editor">
      <header className="catalog-editor__header">
        <h1 className="catalog-editor__title">Editor de catálogo</h1>
        <p className="catalog-editor__intro theme-muted">
          Edita el nombre de las series y los metadatos de cada sección (capítulo).
        </p>
        <EditorActionButton variant="primary" onClick={openSaveModal}>
          Guardar catálogo
        </EditorActionButton>
      </header>

      {notice ? (
        <EditorStatusNotice
          variant={notice.variant}
          message={notice.message}
          onDismiss={clearNotice}
        />
      ) : null}

      <section className="post-editor-metadata" aria-label="Selección de serie">
        <div className="post-editor-metadata__field">
          <CatalogSelect
            id="catalog-serie"
            label="Serie"
            options={seriesOptions}
            value={form.serie}
            isCustom={form.serieIsCustom}
            customValue={form.serieCustom}
            disabled={catalogLoading}
            newOptionLabel="+ Nueva serie…"
            customPlaceholder="Ej. cartas paulinas"
            onSelectExisting={handleSerieExisting}
            onEnableCustom={() =>
              setForm((previous) => ({ ...previous, serieIsCustom: true }))
            }
            onCustomValueChange={(value) =>
              setForm((previous) => ({ ...previous, serieCustom: value }))
            }
            onCommitCustom={() => {}}
          />
        </div>

        <div className="post-editor-metadata__field">
          <label htmlFor="catalog-series-name" className={labelClassName}>
            Nombre visible
          </label>
          <input
            id="catalog-series-name"
            type="text"
            value={form.seriesName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                seriesName: event.target.value,
              }))
            }
            className={inputClassName}
            disabled={!effectiveSerie}
          />
        </div>

        <div className="post-editor-metadata__field">
          <CatalogSelect
            id="catalog-chapter"
            label="Sección"
            options={chapterOptions}
            value={form.chapter}
            isCustom={form.chapterIsCustom}
            customValue={form.chapterCustom}
            disabled={catalogLoading || !canEditChapter(form)}
            newOptionLabel="+ Nuevo capítulo…"
            customPlaceholder="Ej. efesios"
            onSelectExisting={handleChapterExisting}
            onEnableCustom={() =>
              setForm((previous) => ({ ...previous, chapterIsCustom: true }))
            }
            onCustomValueChange={(value) =>
              setForm((previous) => ({ ...previous, chapterCustom: value }))
            }
            onCommitCustom={() => {}}
          />
        </div>
      </section>

      {hubLoading ? (
        <p className="catalog-editor__loading theme-muted">Cargando metadatos…</p>
      ) : null}

      {effectiveChapter ? (
        <section className="catalog-editor__hub-fields">
          <h2 className="catalog-editor__section-title">Metadatos de la sección</h2>

          <label className={labelClassName} htmlFor="hub-section">
            Título de sección
          </label>
          <input
            id="hub-section"
            type="text"
            value={hubForm.section}
            onChange={(event) =>
              setHubForm((previous) => ({
                ...previous,
                section: event.target.value,
              }))
            }
            className={inputClassName}
          />

          <label className={labelClassName} htmlFor="hub-description">
            Descripción
          </label>
          <textarea
            id="hub-description"
            value={hubForm.description}
            onChange={(event) =>
              setHubForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            rows={3}
            className={`${inputClassName} post-editor__field--textarea`}
          />

          <label className={labelClassName} htmlFor="hub-purpose">
            Propósito
          </label>
          <textarea
            id="hub-purpose"
            value={hubForm.purpose}
            onChange={(event) =>
              setHubForm((previous) => ({
                ...previous,
                purpose: event.target.value,
              }))
            }
            rows={3}
            className={`${inputClassName} post-editor__field--textarea`}
          />

          <label className={labelClassName} htmlFor="hub-biblical-text">
            Texto bíblico
          </label>
          <textarea
            id="hub-biblical-text"
            value={hubForm.biblicalText}
            onChange={(event) =>
              setHubForm((previous) => ({
                ...previous,
                biblicalText: event.target.value,
              }))
            }
            rows={2}
            className={`${inputClassName} post-editor__field--textarea`}
          />

          <label className={labelClassName} htmlFor="hub-biblical-reference">
            Referencia bíblica
          </label>
          <input
            id="hub-biblical-reference"
            type="text"
            value={hubForm.biblicalReference}
            onChange={(event) =>
              setHubForm((previous) => ({
                ...previous,
                biblicalReference: event.target.value,
              }))
            }
            className={inputClassName}
          />
        </section>
      ) : (
        <p className="catalog-editor__hint theme-muted">
          Selecciona una sección para editar su hub (descripción, propósito, texto bíblico).
        </p>
      )}

      <SavePasswordModal
        open={modalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={() => {
          if (!isSubmitting) setModalOpen(false);
        }}
        onConfirm={handleSaveWithPassword}
      />
    </div>
  );
}
