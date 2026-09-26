import { useState } from 'react';
import type { WineType } from '../data/wines.js';

const COLORS: Record<WineType, string> = {
  tinto: '#4A1520',
  branco: '#D9C58A',
  rose: '#E7A9A0',
  laranja: '#D08A3C',
  espumante: '#2E3B2A',
  porto: '#3A0F16',
};

/** Garrafa genérica por tipo; silhueta em SVG se a imagem não carregar. */
export function Bottle({ tipo, eager = false }: { tipo: WineType; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg className="bottle bottle--fallback" viewBox="0 0 60 200" aria-hidden="true">
        <path
          d="M25 6h10v44c0 8 13 16 13 34v104c0 4-3 6-6 6H18c-3 0-6-2-6-6V84c0-18 13-26 13-34z"
          fill={COLORS[tipo]}
          stroke="#00273c"
          strokeWidth="1.2"
        />
        <rect x="14" y="110" width="32" height="44" fill="#fff" opacity=".9" />
      </svg>
    );
  }
  return (
    <img
      className="bottle"
      src={`/bottles/${tipo}.webp`}
      alt=""
      width="300"
      height="900"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
