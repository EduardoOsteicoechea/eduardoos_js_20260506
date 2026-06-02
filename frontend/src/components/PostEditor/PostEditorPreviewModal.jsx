import { useMemo, useState } from 'react';
import ArticleGenerator from '../ArticleGenerator/ArticleGenerator';
import { VIEW_MODES } from '../../lib/viewModes';

export default function PostEditorPreviewModal({ open, article, onClose }) {
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const previewArticle = useMemo(() => {
    if (!article || typeof article !== 'object') return null;
    if (!Array.isArray(article.sections)) return null;
    if (!article.title) return null;
    return article;
  }, [article]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[260] bg-black/60 p-4 sm:p-6">
      <div className="theme-surface theme-border mx-auto flex h-full w-full max-w-5xl flex-col rounded-xl border shadow-xl">
        <header className="theme-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
            Vista previa del artículo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="theme-toolbar-btn text-sm"
          >
            Cerrar
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {previewArticle ? (
            <ArticleGenerator
              article={previewArticle}
              slug=""
              viewMode={VIEW_MODES.regular}
              expandedSections={expandedSections}
              onToggleSection={(index) => {
                setExpandedSections((previous) => {
                  const next = new Set(previous);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                });
              }}
            />
          ) : (
            <p className="theme-muted text-sm">
              Completa al menos el título y una sección para previsualizar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
