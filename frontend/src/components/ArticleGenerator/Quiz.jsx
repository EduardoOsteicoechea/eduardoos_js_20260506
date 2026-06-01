import { useMemo, useState } from 'react';

export default function Quiz({ items = [] }) {
  const [answers, setAnswers] = useState({});
  const [resetVersion, setResetVersion] = useState(0);

  const answeredCount = useMemo(
    () => items.filter((_, index) => answers[index] != null).length,
    [answers, items],
  );

  const correctCount = useMemo(
    () =>
      items.filter((item, index) => {
        const selected = answers[index];
        if (selected == null) return false;
        return new Set(item.correct_option ?? []).has(selected);
      }).length,
    [answers, items],
  );

  const allAnswered = items.length > 0 && answeredCount === items.length;
  const hasAnyAnswer = answeredCount > 0;

  const restart = () => {
    setAnswers({});
    setResetVersion((version) => version + 1);
  };

  const setAnswer = (index, option) => {
    setAnswers((previous) => ({ ...previous, [index]: option }));
  };

  if (!items.length) return null;

  return (
    <div className="quiz" key={resetVersion}>
      <div className="space-y-8">
        {items.map((item, index) => (
          <QuizQuestion
            key={`${index}-${item.question}`}
            item={item}
            index={index}
            selected={answers[index] ?? null}
            onSelect={(option) => setAnswer(index, option)}
          />
        ))}
      </div>

      {hasAnyAnswer ? (
        <div className="theme-border mt-8 rounded-lg border px-4 py-4">
          {allAnswered ? (
            <p className="text-base font-semibold">
              Resultado: {correctCount} de {items.length} correctas
            </p>
          ) : (
            <p className="theme-muted text-sm">
              Respondidas: {answeredCount} de {items.length}
            </p>
          )}

          <button
            type="button"
            onClick={restart}
            className="theme-toolbar-btn mt-4"
            aria-label="Reiniciar cuestionario"
          >
            Reiniciar cuestionario
          </button>
        </div>
      ) : null}
    </div>
  );
}

function QuizQuestion({ item, index, selected, onSelect }) {
  const correctSet = new Set(item.correct_option ?? []);
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && correctSet.has(selected);

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
                onClick={() => onSelect(option)}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>

      {isAnswered ? (
        <div
          className="theme-border mt-4 rounded-lg border px-4 py-3 text-sm"
          role="status"
        >
          <p className="font-semibold">
            {isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
          </p>
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
