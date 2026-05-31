import { useState } from 'react';

export default function PostCreator() {
  // State to hold our dynamic input fields
  const [fields, setFields] = useState([{ id: crypto.randomUUID(), value: '' }]);

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), value: '' }]);
  };

  const updateField = (id, newValue) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value: newValue } : field
    ));
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with:", fields);
    // Here you would typically POST to your Node.js backend
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={`Dynamic Input ${index + 1}`}
              className="flex-1 px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200 transition-colors"
          >
            + Add Another Input
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Save Post
          </button>
        </div>
      </form>
    </div>
  );
}