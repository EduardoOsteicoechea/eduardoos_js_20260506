import EmphasizedTextPreview from './EmphasizedTextPreview';
import { inputClassName, labelClassName } from './editorInputStyles';

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
    <div className="space-y-5">
      <ul className="list-disc space-y-5 pl-5">
        {items.map((item, index) => (
          <li key={index} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium opacity-70">Elemento {index + 1}</p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="theme-toolbar-btn text-xs"
              >
                Quitar elemento
              </button>
            </div>

            <div>
              <label className={labelClassName} htmlFor={`list-item-${index}-content`}>
                1. Contenido
              </label>
              <textarea
                id={`list-item-${index}-content`}
                value={item.content ?? ''}
                onChange={(event) =>
                  updateItem(index, 'content', event.target.value)
                }
                rows={2}
                className={`${inputClassName} resize-y`}
              />
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor={`list-item-${index}-emphasized`}
              >
                2. Texto enfatizado
              </label>
              <input
                id={`list-item-${index}-emphasized`}
                type="text"
                value={item.emphasized ?? ''}
                onChange={(event) =>
                  updateItem(index, 'emphasized', event.target.value)
                }
                placeholder="Debe aparecer exactamente en el contenido"
                className={inputClassName}
              />
            </div>

            {(item.content ?? '').trim() ? (
              <p className="text-sm leading-relaxed">
                <EmphasizedTextPreview
                  content={item.content}
                  emphasized={item.emphasized}
                />
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <button type="button" onClick={addItem} className="theme-toolbar-btn text-sm">
        + Añadir elemento
      </button>
    </div>
  );
}
