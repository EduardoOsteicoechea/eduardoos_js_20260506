import { useEffect, useMemo, useState } from 'react';
import SavePasswordModal from './SavePasswordModal';
import CatalogSelect from './CatalogSelect';
import {
  canEditChapter,
  getEffectiveChapter,
  getEffectiveSerie,
  mergeChapterOptions,
  mergeSeriesOptions,
  previewSlug,
  registerChapterInCatalog,
  registerSerieInCatalog,
} from './catalogHelpers';
import {
  buildPostPayload,
  createEmptySection,
  EMPTY_FORM,
} from './buildPostPayload';
import { SectionEditModal } from './sections';
import SectionUnitsPreview from './sections/SectionUnitsPreview';
import { savePostPayload, validateEditorPassword } from './postEditorApi';
import { fetchNextArticleId, fetchSeriesCatalog } from './seriesCatalogApi';

const inputClassName =
  'theme-border w-full rounded-lg border bg-transparent px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

const labelClassName = 'mb-1 block text-sm font-medium';

const sectionHeadingInputClassName =
  'w-full border-0 bg-transparent p-0 text-[1.35em] font-semibold leading-snug outline-none placeholder:opacity-40 focus:ring-0';

export default function PostEditor() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [catalog, setCatalog] = useState({ series: [], chapters: {} });
  const [catalogError, setCatalogError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [articleIdLoading, setArticleIdLoading] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchSeriesCatalog()
      .then((data) => {
        if (cancelled) return;
        setCatalog(data);
        setCatalogError('');
      })
      .catch((error) => {
        if (cancelled) return;
        setCatalogError(
          error instanceof Error ? error.message : 'Error al cargar series',
        );
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const previewPayload = useMemo(
    () => buildPostPayload(form, { forPreview: true }),
    [form],
  );

  useEffect(() => {
    if (!effectiveSerie || !effectiveChapter) {
      setForm((previous) => ({ ...previous, articleId: '' }));
      return undefined;
    }

    let cancelled = false;
    setArticleIdLoading(true);
    setStatusMessage('');

    fetchNextArticleId(effectiveSerie, effectiveChapter)
      .then(({ articleId }) => {
        if (cancelled) return;
        setForm((previous) => ({ ...previous, articleId }));
      })
      .catch((error) => {
        if (cancelled) return;
        setForm((previous) => ({ ...previous, articleId: '' }));
        setStatusMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo asignar el id del artículo',
        );
      })
      .finally(() => {
        if (!cancelled) setArticleIdLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveSerie, effectiveChapter]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSerieExisting = (serie) => {
    const chapters = catalog.chapters[serie] ?? [];
    setForm((previous) => ({
      ...previous,
      serie,
      serieIsCustom: false,
      serieCustom: '',
      chapter: chapters[0] ?? '',
      chapterIsCustom: chapters.length === 0,
      chapterCustom: '',
    }));
  };

  const handleSerieCustom = () => {
    setForm((previous) => ({
      ...previous,
      serieIsCustom: true,
      serieCustom: previous.serieCustom || '',
      chapter: '',
      chapterIsCustom: true,
      chapterCustom: '',
      articleId: '',
    }));
  };

  const handleSerieCustomChange = (value) => {
    updateField('serieCustom', value);
  };

  const commitSerie = (rawValue) => {
    const slug = previewSlug(rawValue);
    if (!slug) return;

    setCatalog((previous) => registerSerieInCatalog(previous, slug));
    setForm((previous) => ({
      ...previous,
      serie: slug,
      serieIsCustom: false,
      serieCustom: '',
      chapter: '',
      chapterIsCustom: true,
      chapterCustom: '',
      articleId: '',
    }));
    setStatusMessage(`Serie "${slug}" añadida. Escribe o añade un capítulo.`);
  };

  const handleChapterExisting = (chapter) => {
    setForm((previous) => ({
      ...previous,
      chapter,
      chapterIsCustom: false,
      chapterCustom: '',
    }));
  };

  const handleChapterCustom = () => {
    setForm((previous) => ({
      ...previous,
      chapterIsCustom: true,
      chapterCustom: previous.chapterCustom || '',
      articleId: '',
    }));
  };

  const handleChapterCustomChange = (value) => {
    updateField('chapterCustom', value);
  };

  const commitChapter = (rawValue) => {
    const slug = previewSlug(rawValue);
    if (!slug || !effectiveSerie) return;

    setCatalog((previous) =>
      registerChapterInCatalog(previous, effectiveSerie, slug),
    );
    setForm((previous) => ({
      ...previous,
      chapter: slug,
      chapterIsCustom: false,
      chapterCustom: '',
    }));
    setStatusMessage(`Capítulo "${slug}" añadido a ${effectiveSerie}.`);
  };

  const updateSectionHeading = (id, heading) => {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section) =>
        section.id === id ? { ...section, heading } : section,
      ),
    }));
  };

  const updateSection = (id, patch) => {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    }));
  };

  const editingSection = form.sections.find(
    (section) => section.id === editingSectionId,
  );

  const addSection = () => {
    setForm((previous) => ({
      ...previous,
      sections: [...previous.sections, createEmptySection()],
    }));
  };

  const removeSection = (id) => {
    setForm((previous) => ({
      ...previous,
      sections:
        previous.sections.length <= 1
          ? [createEmptySection()]
          : previous.sections.filter((section) => section.id !== id),
    }));
  };

  const openSaveModal = () => {
    setModalError('');
    setStatusMessage('');

    if (!effectiveSerie) {
      setStatusMessage('Selecciona o escribe una serie.');
      return;
    }

    if (!effectiveChapter) {
      setStatusMessage('Selecciona o escribe un capítulo (carpeta).');
      return;
    }

    if (!form.title.trim()) {
      setStatusMessage('El título es obligatorio.');
      return;
    }

    if (!form.articleId || articleIdLoading) {
      setStatusMessage('Espera a que se asigne el id del artículo.');
      return;
    }

    setModalOpen(true);
  };

  const handleSaveWithPassword = async (password) => {
    setIsSubmitting(true);
    setModalError('');

    const payload = buildPostPayload(form);

    try {
      const auth = await validateEditorPassword(password);
      console.log('Auth /api/auth/post/editor/:', auth.response.status, auth.data);

      if (!auth.response.ok) {
        setModalError(
          auth.data?.error ?? 'Contraseña incorrecta. No se guardó el artículo.',
        );
        return;
      }

      const save = await savePostPayload(payload);
      console.log('Save /api/post/editor/:', save.response.status, save.data);

      if (!save.response.ok) {
        setModalError(save.data?.error ?? 'No se pudo guardar el artículo.');
        return;
      }

      setModalOpen(false);
      setStatusMessage('Artículo guardado correctamente.');

      if (effectiveSerie && effectiveChapter) {
        const next = await fetchNextArticleId(effectiveSerie, effectiveChapter);
        setForm((previous) => ({
          ...previous,
          articleId: next.articleId,
        }));
      }
    } catch (error) {
      console.error('PostEditor save failed:', error);
      setModalError('Error de red al contactar el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chapterFieldEnabled = canEditChapter(form);

  return (
    <div className="post-editor space-y-8">
      <header>
        <p className="theme-muted text-sm uppercase tracking-wide">Editor</p>
        <h1 className="mt-2 text-3xl font-bold">Nuevo artículo</h1>
        <p className="theme-muted mt-3 text-lg">
          Completa los campos y guarda el JSON en el servidor.
        </p>
      </header>

      {catalogLoading ? (
        <p className="theme-muted text-sm">Cargando series desde /data/series/…</p>
      ) : null}

      {catalogError ? (
        <p className="theme-border rounded-lg border px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {catalogError}
        </p>
      ) : null}

      {statusMessage ? (
        <p
          className="theme-border rounded-lg border px-4 py-3 text-sm"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <section className="theme-border space-y-4 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Metadatos</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <CatalogSelect
            id="post-serie"
            label="Serie"
            options={seriesOptions}
            value={form.serie}
            isCustom={form.serieIsCustom}
            customValue={form.serieCustom}
            disabled={catalogLoading}
            newOptionLabel="+ Nueva serie…"
            customPlaceholder="Ej. cartas paulinas"
            onSelectExisting={handleSerieExisting}
            onEnableCustom={handleSerieCustom}
            onCustomValueChange={handleSerieCustomChange}
            onCommitCustom={commitSerie}
          />

          <CatalogSelect
            id="post-chapter"
            label="Capítulo (carpeta)"
            options={chapterOptions}
            value={form.chapter}
            isCustom={form.chapterIsCustom}
            customValue={form.chapterCustom}
            disabled={catalogLoading || !chapterFieldEnabled}
            newOptionLabel="+ Nuevo capítulo…"
            customPlaceholder="Ej. efesios"
            onSelectExisting={handleChapterExisting}
            onEnableCustom={handleChapterCustom}
            onCustomValueChange={handleChapterCustomChange}
            onCommitCustom={commitChapter}
          />

          <div className="sm:col-span-2">
            <label htmlFor="post-title" className={labelClassName}>
              Título
            </label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="post-creator" className={labelClassName}>
              Autor
            </label>
            <input
              id="post-creator"
              type="text"
              value={form.creator}
              onChange={(event) => updateField('creator', event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        {articleIdLoading ? (
          <p className="theme-muted text-sm">Asignando id del artículo…</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Secciones</h2>
          <button type="button" onClick={addSection} className="theme-toolbar-btn">
            + Sección
          </button>
        </div>

        {form.sections.map((section, index) => (
          <div
            key={section.id}
            className="theme-border space-y-3 rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Sección {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="theme-toolbar-btn shrink-0 text-sm"
              >
                Quitar
              </button>
            </div>

            <input
              type="text"
              value={section.heading}
              onChange={(event) =>
                updateSectionHeading(section.id, event.target.value)
              }
              placeholder="Encabezado de sección"
              aria-label="Encabezado de sección"
              className={sectionHeadingInputClassName}
            />

            <SectionUnitsPreview units={section.content ?? []} />

            <button
              type="button"
              onClick={() => setEditingSectionId(section.id)}
              className="theme-toolbar-btn w-full sm:w-auto"
            >
              Editar sección
            </button>
          </div>
        ))}
      </section>

      <section className="theme-border rounded-xl border p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
          Vista previa JSON
        </h2>
        <pre className="theme-muted overflow-x-auto text-xs leading-relaxed">
          {JSON.stringify(previewPayload, null, 2)}
        </pre>
      </section>

      <div className="flex flex-wrap gap-3 pb-6">
        <button type="button" onClick={openSaveModal} className="theme-toolbar-btn px-5">
          Guardar artículo
        </button>
      </div>

      <SavePasswordModal
        open={modalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={() => {
          if (!isSubmitting) setModalOpen(false);
        }}
        onConfirm={handleSaveWithPassword}
      />

      {editingSection ? (
        <SectionEditModal
          section={editingSection}
          onSave={(updatedSection) => {
            updateSection(updatedSection.id, {
              heading: updatedSection.heading,
              content: updatedSection.content,
            });
            setEditingSectionId(null);
          }}
          onClose={() => setEditingSectionId(null)}
        />
      ) : null}
    </div>
  );
}
