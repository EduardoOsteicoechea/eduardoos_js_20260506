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
      <div className="quiz__questions">
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
        <div className="quiz__result theme-border">
          {allAnswered ? (
            <p className="quiz__result-score">
              Resultado: {correctCount} de {items.length} correctas
            </p>
          ) : (
            <p className="quiz__result-progress theme-muted">
              Respondidas: {answeredCount} de {items.length}
            </p>
          )}

          <button
            type="button"
            onClick={restart}
            className="theme-toolbar-btn quiz__restart"
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
    <div className="quiz-question theme-border">
      <p className="quiz-question__prompt">
        {index + 1}. {item.question}
      </p>
      <ul className="quiz-question__options">
        {item.options.map((option) => {
          let optionClass = 'quiz-question__option theme-border';

          if (isAnswered && correctSet.has(option)) {
            optionClass += ' quiz-question__option--correct';
          } else if (isAnswered && selected === option && !correctSet.has(option)) {
            optionClass += ' quiz-question__option--wrong';
          } else if (isAnswered) {
            optionClass += ' quiz-question__option--dimmed';
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
        <div className="quiz-question__feedback theme-border" role="status">
          <p className="quiz-question__feedback-title">
            {isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
          </p>
          {item.rationale?.map((line, rationaleIndex) => (
            <p key={rationaleIndex} className="quiz-question__rationale theme-muted">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
