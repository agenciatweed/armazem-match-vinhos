import { forwardRef } from 'react';
import type { OptionKey, Question as Q } from '../data/questions.js';
import { Progress } from './Progress.js';
import { Tick } from './Tick.js';

interface Props {
  question: Q;
  step: number;
  selected: OptionKey | undefined;
  pending: OptionKey | null;
  phase: 'idle' | 'leaving' | 'entering';
  answered: number;
  onPick: (key: OptionKey) => void;
  onBack: (() => void) | null;
}

export const Question = forwardRef<HTMLHeadingElement, Props>(function Question(
  { question, step, selected, pending, phase, answered, onPick, onBack },
  titleRef,
) {
  const active = pending ?? selected;
  return (
    <section className={`sheet sheet--question is-${phase}`} aria-labelledby={`${question.id}-title`}>
      <div className="sheet__head">
        {onBack ? (
          <button type="button" className="back" onClick={onBack}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" />
            </svg>
            Voltar
          </button>
        ) : (
          <span>Match do Vinho</span>
        )}
        <Progress step={step} answered={answered} />
      </div>

      <h1 id={`${question.id}-title`} ref={titleRef} className="display display--l question__title" tabIndex={-1}>
        {question.title}
      </h1>

      <ol className="options" aria-label="Escolha uma opção">
        {question.options.map((o, i) => {
          const isOn = active === o.key;
          return (
            <li key={o.key}>
              <button
                type="button"
                className={isOn ? 'option is-on' : 'option'}
                aria-pressed={isOn}
                onClick={() => onPick(o.key)}
              >
                <span className="option__index" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="option__box" aria-hidden="true">
                  <Tick drawn={isOn} />
                </span>
                <span className="option__label">{o.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
});
