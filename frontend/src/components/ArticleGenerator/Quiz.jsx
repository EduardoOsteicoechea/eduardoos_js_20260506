import { useState } from 'react';

export default function Quiz({ items = [], title = 'Comprueba lo aprendido' }) {
  if (!items.length) return null;

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-semibold text-slate-900">{title}</h3>
      <div className="space-y-8">
        {items.map((item, index) => (
          <QuizQuestion key={`${index}-${item.question}`} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function QuizQuestion({ item, index }) {
  const [selected, setSelected] = useState(null);
  const correctSet = new Set(item.correct_option ?? []);
  const isAnswered = selected !== null;
  const isCorrect = selected !== null && correctSet.has(selected);

  return (
    <div className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
      <p className="mb-4 font-medium text-slate-900">
        {index + 1}. {item.question}
      </p>
      <ul className="space-y-2">
        {item.options.map((option) => {
          let optionClass =
            'w-full rounded-lg border px-4 py-3 text-left text-slate-700 transition-colors';

          if (isAnswered && correctSet.has(option)) {
            optionClass += ' border-green-500 bg-green-50 text-green-900';
          } else if (isAnswered && selected === option && !correctSet.has(option)) {
            optionClass += ' border-red-400 bg-red-50 text-red-900';
          } else if (!isAnswered) {
            optionClass += ' border-slate-200 hover:border-blue-400 hover:bg-blue-50/50';
          } else {
            optionClass += ' border-slate-200 opacity-60';
          }

          return (
            <li key={option}>
              <button
                type="button"
                className={optionClass}
                disabled={isAnswered}
                onClick={() => setSelected(option)}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {isAnswered ? (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            isCorrect
              ? 'bg-green-50 text-green-900'
              : 'bg-amber-50 text-amber-950'
          }`}
        >
          <p className="font-semibold">{isCorrect ? 'Correcto' : 'Revisa la respuesta'}</p>
          {item.rationale?.map((line, rationaleIndex) => (
            <p key={rationaleIndex} className="mt-1">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
