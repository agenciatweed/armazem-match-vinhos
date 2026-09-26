/** Cinco caixas de campo: as respondidas ficam preenchidas com o visto, a atual em destaque. */
export function Progress({ step, answered, fresh }: { step: number; answered: number; fresh: number | null }) {
  return (
    <div className="progress">
      <ol className="progress__boxes" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const done = i < answered && i !== step;
          return (
            <li
              key={i}
              className={[
                'progress__box',
                done ? 'is-done' : '',
                i === step ? 'is-current' : '',
                i === fresh ? 'is-fresh' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {done && (
                <svg viewBox="0 0 24 24" className="progress__tick">
                  <path d="M4.5 12.8c1.6 1.2 3.1 2.9 4.4 5.2C11.6 11.4 15.4 6.9 20 4" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
      <span className="progress__text">{step + 1} de 5</span>
    </div>
  );
}
