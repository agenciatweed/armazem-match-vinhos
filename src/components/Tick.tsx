/** Visto de tinta desenhado dentro da caixa de marcação. */
export function Tick({ drawn }: { drawn: boolean }) {
  return (
    <svg className={drawn ? 'tick tick--drawn' : 'tick'} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 12.8c1.6 1.2 3.1 2.9 4.4 5.2C11.6 11.4 15.4 6.9 20 4" pathLength="1" />
    </svg>
  );
}
