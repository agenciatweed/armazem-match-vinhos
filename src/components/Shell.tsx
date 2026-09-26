import type { ReactNode } from 'react';

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="shell">
      <header className="shell__band">
        <img className="shell__logo" src="/logo.svg" alt="Armazém dos Importados" width="120" height="71" />
      </header>
      <main className={wide ? 'shell__main shell__main--wide' : 'shell__main'}>{children}</main>
      <footer className="shell__legal">Aprecie com moderação. Venda proibida para menores de 18 anos.</footer>
    </div>
  );
}
