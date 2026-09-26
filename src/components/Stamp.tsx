/** Carimbo circular de conferência da ficha, na cor do perfil. */
export function Stamp({ color }: { color: string }) {
  return (
    <svg className="stamp" viewBox="0 0 120 120" aria-hidden="true" style={{ color }}>
      <defs>
        <path id="stamp-ring" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fill="currentColor" fontSize="10.5" letterSpacing="2.2" fontFamily="Archivo, sans-serif" fontWeight="600">
        <textPath href="#stamp-ring">ARMAZÉM DOS IMPORTADOS · MATCH 3 ·</textPath>
      </text>
      <path d="M44 61c4 3 7 7 10 12 6-13 13-21 22-27" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
