import { useEffect, useRef } from 'react';
import type { TrioEntry } from '../lib/selection.js';
import { Bottle } from './Bottle.js';
import { Stamp } from './Stamp.js';

interface Props {
  durationMs: number;
  accent: string;
  trio: TrioEntry[];
}

/**
 * A ficha completa: os cinco vistos chegam em fila, se juntam no centro e viram o carimbo;
 * as três garrafas do trio sobem do pé da ficha.
 */
export function Loading({ durationMs, accent, trio }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <section
      className="sheet sheet--main sheet--loading"
      aria-live="polite"
      style={{ ['--accent' as string]: accent, ['--loading-ms' as string]: `${durationMs}ms` }}
    >
      <div className="sheet__rule" aria-hidden="true" />
      <p ref={ref} tabIndex={-1} className="display display--l loading__text">
        Montando seu trio...
      </p>

      <div className="loading__stage" aria-hidden="true">
        <ol className="loading__ticks">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="loading__tick" style={{ ['--n' as string]: i - 2 }}>
              <svg viewBox="0 0 24 24">
                <path d="M4.5 12.8c1.6 1.2 3.1 2.9 4.4 5.2C11.6 11.4 15.4 6.9 20 4" />
              </svg>
            </li>
          ))}
        </ol>
        <div className="loading__stamp">
          <Stamp color={accent} />
        </div>
      </div>

      <div className="loading__bottles" aria-hidden="true">
        {trio.map((t, i) => (
          <div key={t.wine.id} className="loading__bottle" style={{ ['--i' as string]: i }}>
            <Bottle tipo={t.wine.tipo} eager />
          </div>
        ))}
      </div>
    </section>
  );
}
