import { useEffect, useRef } from 'react';

export function Loading({ durationMs }: { durationMs: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="sheet sheet--loading" aria-live="polite">
      <div className="sheet__head">
        <span>Match do Vinho</span>
        <span>Ficha completa</span>
      </div>
      <p ref={ref} tabIndex={-1} className="display display--l loading__text">
        Montando seu trio...
      </p>
      <div className="loading__rule" style={{ animationDuration: `${durationMs}ms` }} aria-hidden="true" />
    </section>
  );
}
