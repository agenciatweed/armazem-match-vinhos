import type { WineType } from '../data/wines.js';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (n: number) => brl.format(n);

export function discounted(total: number, pct: number): number {
  return Math.round(total * (1 - pct / 100) * 100) / 100;
}

export const TYPE_LABEL: Record<WineType, string> = {
  tinto: 'Tinto',
  branco: 'Branco',
  rose: 'Rosé',
  laranja: 'Laranja',
  espumante: 'Espumante',
  porto: 'Fortificado',
};
