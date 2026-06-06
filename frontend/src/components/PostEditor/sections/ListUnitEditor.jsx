import EmphasizedTextPreview from './EmphasizedTextPreview';
import { inputClassName } from './editorInputStyles';

export default function ListUnitEditor({ items = [], onChange }) {
  const updateItem = (index, field, value) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    onChange([...items, { content: '', emphasized: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      onChange([{ content: '', emphasized: '' }]);
      return;
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="list-unit-editor">
      <ul className="list-unit-editor__items">
        {items.map((item, index) => (
          <li key={index} className="list-unit-editor__item-fields">
            <div className="list-unit-editor__item-header">
              <p className="list-unit-editor__item-label">Elemento {index + 1}</p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="theme-toolbar-btn list-unit-editor__remove-btn"
              >
                Quitar elemento
              </button>
            </div>

            <textarea
              id={`list-item-${index}-content`}
              value={item.content ?? ''}
              onChange={(event) =>
                updateItem(index, 'content', event.target.value)
              }
              rows={2}
              placeholder="Contenido"
              aria-label={`Contenido del elemento ${index + 1}`}
              className={`${inputClassName} post-editor__field--textarea`}
            />

            <input
              id={`list-item-${index}-emphasized`}
              type="text"
              value={item.emphasized ?? ''}
              onChange={(event) =>
                updateItem(index, 'emphasized', event.target.value)
              }
              placeholder="Texto enfatizado (opcional)"
              aria-label={`Texto enfatizado del elemento ${index + 1}`}
              className={inputClassName}
            />

            {(item.content ?? '').trim() ? (
              <p className="list-unit-editor__preview">
                <EmphasizedTextPreview
                  content={item.content}
                  emphasized={item.emphasized}
                />
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addItem}
        className="theme-toolbar-btn list-unit-editor__add-item-btn"
      >
        + Añadir elemento
      </button>
    </div>
  );
}
