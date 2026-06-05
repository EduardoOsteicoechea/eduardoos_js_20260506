import { useCallback, useEffect, useMemo, useState } from 'react';
import EditorActionButton from '../EditorActionButton';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';
import EditorStatusNotice from '../EditorStatusNotice';
import SavePasswordModal from './SavePasswordModal';
import CatalogSelect from './CatalogSelect';
import PostEditorPreviewModal from './PostEditorPreviewModal';
import {
  clearActivityBarLeftActions,
  setActivityBarLeftActions,
} from '../../lib/activityBarActionsStore';
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
  normalizeFolderName,
} from './buildPostPayload';
import { normalizeKebabInput } from './slugify';
import { SectionEditModal } from './sections';
import SectionUnitsPreview from './sections/SectionUnitsPreview';
import { downloadArticlePdf } from '../../lib/articlePdfDownload';
import { savePostPayloadWithAssets, validateEditorPassword } from './postEditorApi';
import {
  fetchNextArticleId,
  fetchSeriesArticle,
  fetchSeriesArticles,
  fetchSeriesCatalog,
} from './seriesCatalogApi';

const inputClassName = UI_FIELD_CLASS;

const labelClassName = 'mb-1 block text-sm font-medium';

const sectionHeadingInputClassName =
  'w-full border-0 bg-transparent p-0 text-[1.35em] font-semibold leading-snug outline-none placeholder:opacity-40 focus:ring-0';
const NEW_TITLE_OPTION = '__new_title__';
const CUSTOM_TITLE_OPTION = '__custom_title__';

function createUnitFromBlock(block) {
  const id = crypto.randomUUID();

  if (Array.isArray(block.list)) {
    const list = block.list.map((item) => {
      if (typeof item === 'string') {
        return { content: item, emphasized: '' };
      }
      if (item && typeof item === 'object') {
        const content = String(item.text ?? '');
        const emphasized = Array.isArray(item.emphasized_phrases)
          ? String(item.emphasized_phrases[0] ?? '')
          : '';
        return { content, emphasized };
      }
      return { content: '', emphasized: '' };
    });

    return {
      id,
      type: 'list',
      data: { list: list.length ? list : [{ content: '', emphasized: '' }] },
    };
  }

  if (block.biblical_reference != null) {
    return {
      id,
      type: 'biblical_quote',
      data: {
        content: String(block.text ?? ''),
        emphasized: Array.isArray(block.emphasized_phrases)
          ? String(block.emphasized_phrases[0] ?? '')
          : '',
        reference: String(block.biblical_reference ?? ''),
      },
    };
  }

  if (block.image != null || block.name != null || block.fileName != null) {
    return {
      id,
      type: 'image',
      data: {
        image: String(block.image ?? ''),
        alt: String(block.alt ?? ''),
        name: String(block.name ?? block.fileName ?? ''),
      },
    };
  }

  if (block.video != null || block.caption != null || block.name != null || block.fileName != null) {
    return {
      id,
      type: 'video',
      data: {
        video: String(block.video ?? ''),
        alt: String(block.text ?? block.caption ?? ''),
        name: String(block.name ?? block.fileName ?? ''),
      },
    };
  }

  if (block.audio != null || block.label != null || block.name != null || block.fileName != null) {
    return {
      id,
      type: 'audio',
      data: {
        audio: String(block.audio ?? ''),
        text: String(block.text ?? block.label ?? ''),
        name: String(block.name ?? block.fileName ?? ''),
      },
    };
  }

  if (block.href != null) {
    return {
      id,
      type: 'link',
      data: {
        href: String(block.href ?? ''),
        text: String(block.text ?? ''),
      },
    };
  }

  return {
    id,
    type: 'paragraph',
    data: {
      content: String(block.text ?? ''),
      emphasized: Array.isArray(block.emphasized_phrases)
        ? String(block.emphasized_phrases[0] ?? '')
        : '',
    },
  };
}

function buildEditorSectionsFromArticle(article) {
  if (!article || typeof article !== 'object') return [createEmptySection()];
  const sections = Array.isArray(article.sections) ? article.sections : [];
  const mapped = sections.map((section) => {
    const content = Array.isArray(section.content) ? section.content : [];
    return {
      id: crypto.randomUUID(),
      heading: String(section.heading ?? ''),
      content: content
        .filter((block) => block && typeof block === 'object')
        .map((block) => createUnitFromBlock(block)),
    };
  });

  return mapped.length ? mapped : [createEmptySection()];
}

export default function PostEditor() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [catalog, setCatalog] = useState({ series: [], chapters: {} });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [modalError, setModalError] = useState('');
  const [notice, setNotice] = useState(null);
  const [articleIdLoading, setArticleIdLoading] = useState(false);
  const [existingArticles, setExistingArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [loadedArticleId, setLoadedArticleId] = useState('');
  const [titleIsCustom, setTitleIsCustom] = useState(true);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState(null);
  const [deleteSectionInput, setDeleteSectionInput] = useState('');

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
        if (cancelled) return;
        setCatalog(data);
        clearNotice();
      })
      .catch((error) => {
        if (cancelled) return;
        showNotice(
          'error',
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

  const previewArticlePayload = useMemo(() => buildPostPayload(form), [form]);
  const selectedExistingArticle = useMemo(
    () =>
      existingArticles.find((article) => article.articleId === selectedArticleId) ??
      null,
    [existingArticles, selectedArticleId],
  );
  const hasCustomTitle = Boolean(form.title.trim());

  const effectiveTitle = useMemo(() => {
    const fromForm = form.title.trim();
    if (fromForm) return fromForm;
    return selectedExistingArticle?.title?.trim() ?? '';
  }, [form.title, selectedExistingArticle]);

  const effectiveArticleId = useMemo(() => {
    const fromForm = form.articleId?.trim();
    if (fromForm) return fromForm;
    const fromSelection = selectedExistingArticle?.articleId?.trim();
    if (fromSelection) return fromSelection;
    return normalizeFolderName(form.folderName);
  }, [form.articleId, form.folderName, selectedExistingArticle]);
  useEffect(() => {
    if (!effectiveSerie || !effectiveChapter) {
      setExistingArticles([]);
      setSelectedArticleId('');
      setLoadedArticleId('');
      setForm((previous) => ({ ...previous, articleId: '' }));
      return undefined;
    }

    let cancelled = false;

    fetchSeriesArticles(effectiveSerie, effectiveChapter)
      .then((articles) => {
        if (cancelled) return;
        setExistingArticles(articles);
      })
      .catch((error) => {
        if (cancelled) return;
        setExistingArticles([]);
        showNotice(
          'error',
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la lista de artículos',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveSerie, effectiveChapter]);

  useEffect(() => {
    if (
      !effectiveSerie ||
      !effectiveChapter ||
      selectedExistingArticle?.articleId
    ) {
      if (!selectedExistingArticle?.articleId) {
        setForm((previous) => ({ ...previous, articleId: '' }));
      }
      setArticleIdLoading(false);
      return undefined;
    }

    let cancelled = false;
    setArticleIdLoading(true);
    clearNotice();

    fetchNextArticleId(effectiveSerie, effectiveChapter)
      .then(({ articleId }) => {
        if (cancelled) return;
        setForm((previous) => ({ ...previous, articleId }));
      })
      .catch((error) => {
        if (cancelled) return;
        setForm((previous) => ({ ...previous, articleId: '' }));
        showNotice(
          'error',
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
  }, [effectiveSerie, effectiveChapter, selectedExistingArticle?.articleId]);

  useEffect(() => {
    const selectedId = selectedExistingArticle?.articleId;
    if (!effectiveSerie || !effectiveChapter || !selectedId) {
      setLoadedArticleId('');
      return undefined;
    }

    if (loadedArticleId === selectedId) return undefined;

    let cancelled = false;
    setArticleIdLoading(true);
    setPendingMediaFiles(new Map());

    fetchSeriesArticle(effectiveSerie, effectiveChapter, selectedId)
      .then((article) => {
        if (cancelled) return;
        const loadedTitle = String(article?.title ?? '').trim();
        const listTitle =
          existingArticles.find((entry) => entry.articleId === selectedId)?.title?.trim() ??
          '';
        const resolvedTitle = loadedTitle || listTitle || selectedId;
        console.log('[PostEditor] article loaded:', {
          selectedId,
          loadedTitle,
          listTitle,
          resolvedTitle,
          article,
        });
        setForm((previous) => ({
          ...previous,
          articleId: selectedId,
          folderName: selectedId,
          title: resolvedTitle,
          creator: String(article?.creator ?? ''),
          posts: Array.isArray(article?.posts) ? article.posts : [],
          sections: buildEditorSectionsFromArticle(article),
        }));
        setLoadedArticleId(selectedId);
      })
      .catch((error) => {
        if (cancelled) return;
        showNotice(
          'error',
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el artículo seleccionado',
        );
      })
      .finally(() => {
        if (!cancelled) setArticleIdLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    effectiveSerie,
    effectiveChapter,
    loadedArticleId,
    selectedExistingArticle?.articleId,
  ]);

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
      articleId: '',
      folderName: '',
      title: '',
      sections: [createEmptySection()],
    }));
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(true);
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
      folderName: '',
      title: '',
      sections: [createEmptySection()],
    }));
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(true);
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
    showNotice('success', `Serie "${slug}" añadida. Escribe o añade un capítulo.`);
  };

  const handleChapterExisting = (chapter) => {
    setForm((previous) => ({
      ...previous,
      chapter,
      chapterIsCustom: false,
      chapterCustom: '',
      articleId: '',
      folderName: '',
      title: '',
      sections: [createEmptySection()],
    }));
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(true);
  };

  const handleChapterCustom = () => {
    setForm((previous) => ({
      ...previous,
      chapterIsCustom: true,
      chapterCustom: previous.chapterCustom || '',
      articleId: '',
      folderName: '',
      title: '',
      sections: [createEmptySection()],
    }));
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(true);
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
      articleId: '',
      folderName: '',
      title: '',
      sections: [createEmptySection()],
    }));
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(true);
    showNotice('success', `Capítulo "${slug}" añadido a ${effectiveSerie}.`);
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
  const sectionPendingDelete = form.sections.find(
    (section) => section.id === deleteSectionId,
  );

  const addSection = () => {
    setForm((previous) => ({
      ...previous,
      sections: [createEmptySection(), ...previous.sections],
    }));
  };

  const addSectionAfter = (sectionId) => {
    const nextSection = createEmptySection();
    setForm((previous) => {
      const index = previous.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) {
        return {
          ...previous,
          sections: [...previous.sections, nextSection],
        };
      }

      return {
        ...previous,
        sections: [
          ...previous.sections.slice(0, index + 1),
          nextSection,
          ...previous.sections.slice(index + 1),
        ],
      };
    });
  };

  const removeSection = (id) => {
    const removedSection = form.sections.find((section) => section.id === id);
    if (removedSection) {
      const removedUnitIds = new Set(
        (removedSection.content ?? []).map((unit) => unit.id),
      );
      setPendingMediaFiles((previous) => {
        const next = new Map(previous);
        for (const unitId of removedUnitIds) next.delete(unitId);
        return next;
      });
    }

    setForm((previous) => ({
      ...previous,
      sections:
        previous.sections.length <= 1
          ? [createEmptySection()]
          : previous.sections.filter((section) => section.id !== id),
    }));
  };

  const openDeleteSectionModal = (sectionId) => {
    setDeleteSectionId(sectionId);
    setDeleteSectionInput('');
  };

  const closeDeleteSectionModal = () => {
    setDeleteSectionId(null);
    setDeleteSectionInput('');
  };

  const confirmDeleteSection = () => {
    if (!sectionPendingDelete) return;
    const expectedHeading = sectionPendingDelete.heading.trim();
    if (deleteSectionInput.trim() !== expectedHeading) return;
    removeSection(sectionPendingDelete.id);
    closeDeleteSectionModal();
  };

  const commitNewTitle = () => {
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) return;
    setSelectedArticleId('');
    setLoadedArticleId('');
    setTitleIsCustom(false);
    showNotice('success', `Título nuevo "${trimmedTitle}" listo para crear artículo.`);
  };

  const openSaveModal = useCallback(() => {
    setModalError('');
    clearNotice();

    const saveDebug = {
      formTitle: form.title,
      formTitleTrimmed: form.title.trim(),
      selectedArticleId,
      selectedExistingArticle,
      effectiveTitle,
      effectiveSerie,
      effectiveChapter,
      effectiveArticleId,
      formFolderName: form.folderName,
      articleIdLoading,
      titleIsCustom,
      existingArticlesCount: existingArticles.length,
    };
    console.log('[PostEditor] save clicked — validation state:', saveDebug);

    const failSaveAttempt = (message, reason) => {
      console.warn('[PostEditor] save blocked:', reason, saveDebug);
      showNotice('warning', message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!effectiveSerie) {
      failSaveAttempt('Selecciona o escribe una serie.', 'missing-serie');
      return;
    }

    if (!effectiveChapter) {
      failSaveAttempt('Selecciona o escribe un capítulo (carpeta).', 'missing-chapter');
      return;
    }

    if (!effectiveTitle) {
      failSaveAttempt('El título es obligatorio.', 'missing-title');
      return;
    }

    if (!normalizeFolderName(form.folderName)) {
      failSaveAttempt('El nombre de carpeta es obligatorio.', 'missing-folder-name');
      return;
    }

    if (!effectiveArticleId || articleIdLoading) {
      failSaveAttempt('Espera a que se asigne el id del artículo.', 'missing-article-id');
      return;
    }

    console.log('[PostEditor] save validation passed, opening password modal');
    setModalOpen(true);
  }, [
    articleIdLoading,
    effectiveArticleId,
    effectiveChapter,
    effectiveSerie,
    effectiveTitle,
    existingArticles.length,
    form.folderName,
    form.title,
    selectedArticleId,
    selectedExistingArticle,
    titleIsCustom,
    clearNotice,
    showNotice,
  ]);

  const validateEditorForExport = useCallback(() => {
    if (!effectiveSerie) {
      showNotice('warning', 'Selecciona o escribe una serie.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!effectiveChapter) {
      showNotice('warning', 'Selecciona o escribe un capítulo (carpeta).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!effectiveTitle) {
      showNotice('warning', 'El título es obligatorio.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!normalizeFolderName(form.folderName)) {
      showNotice('warning', 'El nombre de carpeta es obligatorio.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!effectiveArticleId || articleIdLoading) {
      showNotice('warning', 'Espera a que se asigne el id del artículo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }

    return buildPostPayload({
      ...form,
      title: effectiveTitle,
      articleId: effectiveArticleId,
      folderName: form.folderName || effectiveArticleId,
    });
  }, [
    articleIdLoading,
    effectiveArticleId,
    effectiveChapter,
    effectiveSerie,
    effectiveTitle,
    form,
    showNotice,
  ]);

  const handleDownloadPdf = useCallback(async () => {
    clearNotice();
    const payload = validateEditorForExport();
    if (!payload) return;

    setIsGeneratingPdf(true);
    try {
      await downloadArticlePdf(payload);
      showNotice('success', 'PDF descargado.');
    } catch (error) {
      console.error('PostEditor PDF failed:', error);
      showNotice(
        'warning',
        error instanceof Error ? error.message : 'No se pudo generar el PDF.',
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [clearNotice, showNotice, validateEditorForExport]);

  const handleSaveWithPassword = async (password) => {
    setIsSubmitting(true);
    setModalError('');

    const payload = buildPostPayload({
      ...form,
      title: effectiveTitle,
      articleId: effectiveArticleId,
      folderName: form.folderName || effectiveArticleId,
    });

    try {
      const auth = await validateEditorPassword(password);
      console.log('Auth /api/auth/post/editor/:', auth.response.status, auth.data);

      if (!auth.response.ok) {
        setModalError(
          auth.data?.error ?? 'Contraseña incorrecta. No se guardó el artículo.',
        );
        return;
      }

      const save = await savePostPayloadWithAssets(payload);
      console.log('Save /api/post/editor/:', save.response.status, save.data);

      if (!save.response.ok) {
        setModalError(save.data?.error ?? 'No se pudo guardar el artículo.');
        return;
      }

      setModalOpen(false);
      showNotice('success', 'Artículo guardado correctamente.');

      if (!selectedExistingArticle?.articleId && effectiveSerie && effectiveChapter) {
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
  const activityActions = useMemo(
    () => [
      {
        id: 'save',
        icon: 'save',
        title: 'Guardar artículo',
        onClick: openSaveModal,
        disabled: isSubmitting || isGeneratingPdf,
      },
      {
        id: 'print',
        icon: 'print',
        title: 'Descargar PDF',
        onClick: handleDownloadPdf,
        disabled: isSubmitting || isGeneratingPdf,
      },
      {
        id: 'scroll-up',
        label: '↑',
        title: 'Ir al inicio',
        onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
      {
        id: 'scroll-down',
        label: '↓',
        title: 'Ir al final',
        onClick: () =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          }),
      },
      {
        id: 'preview',
        icon: 'eye',
        title: 'Previsualizar artículo',
        onClick: () => setPreviewModalOpen(true),
      },
    ],
    [handleDownloadPdf, isGeneratingPdf, isSubmitting, openSaveModal],
  );

  useEffect(() => {
    setActivityBarLeftActions(activityActions);
    return () => clearActivityBarLeftActions();
  }, [activityActions]);

  return (
    <div className="post-editor space-y-6 pb-[calc(var(--activity-bar-height)+1.25rem)]">
      <section className="post-editor-metadata" aria-label="Metadatos del artículo">
        <div className="post-editor-metadata__row">
          <div className="post-editor-metadata__cell">
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
          </div>

          <div className="post-editor-metadata__cell">
            <CatalogSelect
              id="post-chapter"
              label="Sección"
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
          </div>
        </div>

        <div className="post-editor-metadata__row">
          <div className="post-editor-metadata__cell">
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

          <div className="post-editor-metadata__cell">
            <label htmlFor="post-folder-name" className={labelClassName}>
              Nombre de carpeta
            </label>
            <input
              id="post-folder-name"
              type="text"
              value={form.folderName}
              onChange={(event) =>
                updateField('folderName', normalizeKebabInput(event.target.value))
              }
              placeholder="ej: el_origen_de_pablo"
              maxLength={50}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="post-editor-metadata__cell post-editor-metadata__cell--full">
          <label htmlFor="post-title" className={labelClassName}>
            Título
          </label>
            <div className="relative">
              <select
                id="post-title"
                value={
                  titleIsCustom
                    ? NEW_TITLE_OPTION
                    : selectedArticleId
                      ? selectedArticleId
                      : hasCustomTitle
                        ? CUSTOM_TITLE_OPTION
                        : NEW_TITLE_OPTION
                }
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === NEW_TITLE_OPTION) {
                    setSelectedArticleId('');
                    setLoadedArticleId('');
                    setTitleIsCustom(true);
                    setPendingMediaFiles(new Map());
                    setForm((previous) => ({
                      ...previous,
                      title: '',
                      folderName: '',
                      creator: EMPTY_FORM.creator,
                      posts: [],
                      sections: [createEmptySection()],
                    }));
                    return;
                  }
                  if (next === CUSTOM_TITLE_OPTION) {
                    setSelectedArticleId('');
                    setLoadedArticleId('');
                    setTitleIsCustom(false);
                    return;
                  }
                  const selected = existingArticles.find(
                    (article) => article.articleId === next,
                  );
                  if (!selected) return;
                  setSelectedArticleId(selected.articleId);
                  setTitleIsCustom(false);
                  const nextTitle = selected.title || selected.articleId;
                  console.log('[PostEditor] title select changed:', {
                    articleId: selected.articleId,
                    title: nextTitle,
                    selected,
                  });
                  setForm((previous) => ({
                    ...previous,
                    title: nextTitle,
                    articleId: selected.articleId,
                    folderName: selected.articleId,
                  }));
                }}
                className={`${inputClassName} h-10 appearance-none pr-10`}
                required
              >
                <option value={NEW_TITLE_OPTION}>+ Nuevo título…</option>
                {hasCustomTitle && !selectedArticleId ? (
                  <option value={CUSTOM_TITLE_OPTION}>{form.title.trim()}</option>
                ) : null}
                {existingArticles.map((article) => (
                  <option key={article.articleId} value={article.articleId}>
                    {article.title}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-80"
              >
                ▼
              </span>
            </div>
            {titleIsCustom ? (
              <div className="post-editor-title-row mt-2 flex items-stretch gap-2">
                <input
                  id="post-title-custom"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      commitNewTitle();
                    }
                  }}
                  className={`${inputClassName} min-w-0 flex-1`}
                  placeholder="Escribe el nuevo título"
                  required
                />
                <EditorActionButton
                  type="button"
                  onClick={commitNewTitle}
                  disabled={!form.title.trim()}
                  className="shrink-0 whitespace-nowrap"
                >
                  Añadir título
                </EditorActionButton>
              </div>
            ) : null}
            {selectedExistingArticle && !titleIsCustom ? (
              <EditorActionButton
                variant="primary"
                className="mt-2"
                onClick={() => setTitleIsCustom(true)}
              >
                Editar título
              </EditorActionButton>
            ) : null}
        </div>

        {articleIdLoading ? (
          <p className="theme-muted px-3 py-2 text-sm sm:px-4">
            {selectedExistingArticle
              ? 'Cargando artículo existente…'
              : 'Asignando id del artículo…'}
          </p>
        ) : null}
      </section>

      {catalogLoading ? (
        <p className="theme-muted px-5 text-sm">Cargando series desde /data/series/…</p>
      ) : null}

      {notice ? (
        <EditorStatusNotice
          variant={notice.variant}
          message={notice.message}
          onDismiss={clearNotice}
        />
      ) : null}

      <section className="post-editor-sections space-y-3 px-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <EditorActionButton variant="primary" onClick={addSection}>
            + Sección
          </EditorActionButton>
        </div>

        {form.sections.map((section, index) => (
          <div key={section.id} className="space-y-2">
            <div className="theme-border space-y-2 rounded-xl border p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="text-[1.35em] font-semibold leading-snug">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(event) =>
                      updateSectionHeading(section.id, event.target.value)
                    }
                    placeholder="Encabezado de sección"
                    aria-label={`Encabezado de la sección ${index + 1}`}
                    className={sectionHeadingInputClassName}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <EditorActionButton
                      variant="primary"
                      className="px-3 text-sm"
                      onClick={() => setEditingSectionId(section.id)}
                    >
                      Editar
                    </EditorActionButton>
                    <EditorActionButton
                      variant="danger"
                      className="px-3 text-sm"
                      onClick={() => openDeleteSectionModal(section.id)}
                    >
                      Quitar
                    </EditorActionButton>
                </div>
              </div>

              <SectionUnitsPreview units={section.content ?? []} />

            </div>

            <EditorActionButton
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => addSectionAfter(section.id)}
            >
              + Sección
            </EditorActionButton>
          </div>
        ))}
      </section>

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

      <PostEditorPreviewModal
        open={previewModalOpen}
        article={previewArticlePayload}
        onClose={() => setPreviewModalOpen(false)}
      />

      {sectionPendingDelete ? (
        <div className="fixed inset-0 z-[270] bg-black/60 p-4">
          <div className="theme-surface theme-border mx-auto mt-16 w-full max-w-xl rounded-xl border p-5 shadow-xl">
            <h3 className="text-base font-semibold">Confirmar eliminación de sección</h3>
            <p className="theme-muted mt-2 text-sm">
              Para eliminar esta sección, escribe exactamente su encabezado:
            </p>
            <p className="mt-1 text-sm font-semibold">
              {sectionPendingDelete.heading.trim() || '(sin encabezado)'}
            </p>

            <div className="mt-4">
              <label className={labelClassName} htmlFor="delete-section-confirm">
                Encabezado de confirmación
              </label>
              <input
                id="delete-section-confirm"
                type="text"
                value={deleteSectionInput}
                onChange={(event) => setDeleteSectionInput(event.target.value)}
                className={inputClassName}
                autoFocus
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteSectionModal}
                className="theme-toolbar-btn px-4"
              >
                Cancelar
              </button>
              <EditorActionButton
                variant="danger"
                className="px-4 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={confirmDeleteSection}
                disabled={
                  deleteSectionInput.trim() !== sectionPendingDelete.heading.trim()
                }
              >
                Eliminar
              </EditorActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
