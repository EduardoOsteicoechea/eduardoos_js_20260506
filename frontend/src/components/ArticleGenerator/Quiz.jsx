import { useState } from 'react';

export default function Quiz({ items = [], title = 'Comprueba lo aprendido' }) {
  if (!items.length) return null;

  return (
    <section className="theme-border mt-10 rounded-xl border p-6">
      <h3 className="mb-6 text-xl font-semibold">{title}</h3>
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
    <div className="theme-border border-t pt-6 first:border-t-0 first:pt-0">
      <p className="mb-4 font-medium">
        {index + 1}. {item.question}
      </p>
      <ul className="space-y-2">
        {item.options.map((option) => {
          let optionClass =
            'theme-border w-full rounded-lg border px-4 py-3 text-left transition-colors';

          if (isAnswered && correctSet.has(option)) {
            optionClass += ' font-semibold ring-2 ring-black dark:ring-white';
          } else if (isAnswered && selected === option && !correctSet.has(option)) {
            optionClass += ' opacity-40';
          } else if (!isAnswered) {
            optionClass += ' hover:bg-black/5 dark:hover:bg-white/10';
          } else {
            optionClass += ' opacity-50';
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
        <div className="theme-border mt-4 rounded-lg border px-4 py-3 text-sm">
          <p className="font-semibold">{isCorrect ? 'Correcto' : 'Revisa la respuesta'}</p>
          {item.rationale?.map((line, rationaleIndex) => (
            <p key={rationaleIndex} className="theme-muted mt-1">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
