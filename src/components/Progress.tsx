/** Cinco caixas de campo: as respondidas levam um traço de tinta, a atual fica em destaque. */
export function Progress({ step, answered }: { step: number; answered: number }) {
  return (
    <div className="progress">
      <ol className="progress__boxes" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className={['progress__box', i < answered && i !== step ? 'is-done' : '', i === step ? 'is-current' : '']
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </ol>
      <span className="progress__text">{step + 1} de 5</span>
    </div>
  );
}
