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
    <div className="post-editor-preview-overlay">
      <div className="post-editor-preview-dialog theme-surface theme-border">
        <header className="post-editor-preview-dialog__header">
          <h2 className="post-editor-preview-dialog__title">
            Vista previa del artículo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="theme-toolbar-btn"
          >
            Cerrar
          </button>
        </header>

        <div className="post-editor-preview-dialog__body">
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
            <p className="theme-muted">
              Completa al menos el título y una sección para previsualizar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
