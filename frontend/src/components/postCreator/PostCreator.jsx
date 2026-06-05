import { useState } from 'react';
import { UI_FIELD_CLASS } from '../../lib/uiClasses';

export default function PostCreator() {
  const [fields, setFields] = useState([{ id: crypto.randomUUID(), value: '' }]);

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), value: '' }]);
  };

  const updateField = (id, newValue) => {
    setFields(fields.map((field) =>
      field.id === id ? { ...field, value: newValue } : field,
    ));
  };

  const removeField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with:', fields);
  };

  return (
    <div className="post-creator">
      <h2 className="post-creator__title">Create New Post</h2>

      <form onSubmit={handleSubmit} className="post-creator__form">
        {fields.map((field, index) => (
          <div key={field.id} className="post-creator__field-row">
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={`Dynamic Input ${index + 1}`}
              className={`${UI_FIELD_CLASS} post-editor__field--grow`}
            />
            {fields.length > 1 ? (
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="post-creator__remove-btn"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}

        <div className="post-creator__actions">
          <button type="button" onClick={addField} className="post-creator__add-btn">
            + Add Another Input
          </button>

          <button type="submit" className="post-creator__submit-btn">
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
}
