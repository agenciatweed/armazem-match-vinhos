import type { ProfileId } from './questions.js';

export type Slot = 'tinto' | 'branco' | 'adicional';
export type Tier = 'seguro' | 'descoberta' | 'surpresa';

export interface Profile {
  id: ProfileId;
  name: string;          // exibido em caixa alta
  tagline: string;
  description: string;
  accent: string;        // cor de destaque do perfil
  tiers: Record<Tier, Slot>; // qual slot ocupa cada faixa (antes da regra de corpo)
}

export const PROFILES: Record<ProfileId, Profile> = {
  fresco: {
    id: 'fresco',
    name: 'Fresco & Cítrico',
    tagline: 'Sua taça gosta de acidez, leveza e frescor.',
    description: 'Você pede limão na água, prefere o mar ao sofá e acha que o primeiro gole tem que acordar. Seus vinhos têm energia, leveza e aquele frescor que chama o segundo gole.',
    accent: '#2F6B5E',
    tiers: { seguro: 'branco', descoberta: 'adicional', surpresa: 'tinto' },
  },
  floral: {
    id: 'floral',
    name: 'Floral & Aromático',
    tagline: 'Você gosta de vinho que chega primeiro pelo nariz.',
    description: 'Para você, o perfume é metade da experiência. Flores, frutas cheirosas, especiarias: você gosta de vinho que se apresenta antes mesmo do primeiro gole.',
    accent: '#7A4E7E',
    tiers: { seguro: 'branco', descoberta: 'adicional', surpresa: 'tinto' },
  },
  frutado: {
    id: 'frutado',
    name: 'Frutado & Macio',
    tagline: 'Você prefere vinhos fáceis de gostar e difíceis de largar.',
    description: 'Nada de aspereza nem complicação. Você gosta de fruta madura, textura macia e vinhos que combinam com mesa cheia e conversa longa.',
    accent: '#A13D3B',
    tiers: { seguro: 'tinto', descoberta: 'adicional', surpresa: 'branco' },
  },
  elegante: {
    id: 'elegante',
    name: 'Seco & Elegante',
    tagline: 'Menos exuberância, mais precisão.',
    description: 'Você prefere o detalhe ao exagero. Gosta de vinhos secos, bem desenhados, que acompanham a comida em vez de disputar atenção com ela.',
    accent: '#3B3A36',
    tiers: { seguro: 'branco', descoberta: 'tinto', surpresa: 'adicional' },
  },
  curva: {
    id: 'curva',
    name: 'Fora da Curva',
    tagline: 'Você provavelmente não quer beber sempre a mesma coisa.',
    description: 'Uva que ninguém conhece, país improvável, vinho feito em talha de barro: se tem história, você quer provar. Seu paladar é curioso, e a gente adora isso.',
    accent: '#B8652A',
    tiers: { seguro: 'branco', descoberta: 'tinto', surpresa: 'adicional' },
  },
};

export const TIER_COPY: Record<Tier, { label: string; hint: string }> = {
  seguro:     { label: 'O SEGURO',     hint: 'Perto do que você já conhece.' },
  descoberta: { label: 'A DESCOBERTA', hint: 'Um passo além.' },
  surpresa:   { label: 'A SURPRESA',   hint: 'Algo que você provavelmente não escolheria sozinho.' },
};
