export type ProfileId = 'fresco' | 'floral' | 'frutado' | 'elegante' | 'curva';
export type OptionKey = 'a' | 'b' | 'c' | 'd' | 'e';
export type Weights = Partial<Record<ProfileId | 'corpo', number>>;

export interface Option { key: OptionKey; label: string; weights: Weights; }
export interface Question { id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5'; title: string; options: Option[]; }

export const QUESTIONS: Question[] = [
  { id: 'q1', title: 'Seu café ideal é...', options: [
    { key: 'a', label: 'Espresso curto, sem açúcar', weights: { elegante: 3, corpo: 2 } },
    { key: 'b', label: 'Espresso tônica com limão', weights: { fresco: 3, curva: 1 } },
    { key: 'c', label: 'Cappuccino com canela', weights: { floral: 3, frutado: 1 } },
    { key: 'd', label: 'Com leite e um docinho do lado', weights: { frutado: 3 } },
    { key: 'e', label: 'Um método que ninguém na mesa conhece', weights: { curva: 3, elegante: 1 } },
  ]},
  { id: 'q2', title: 'Na fruteira, qual some primeiro?', options: [
    { key: 'a', label: 'Bergamota', weights: { fresco: 3, floral: 1 } },
    { key: 'b', label: 'Lichia', weights: { floral: 3 } },
    { key: 'c', label: 'Morango', weights: { frutado: 3 } },
    { key: 'd', label: 'Maçã verde', weights: { elegante: 3, fresco: 1 } },
    { key: 'e', label: 'Figo fresco', weights: { curva: 3, frutado: 1, corpo: 1 } },
  ]},
  { id: 'q3', title: 'Hoje à noite, o jantar perfeito seria...', options: [
    { key: 'a', label: 'Sushi no balcão', weights: { fresco: 3, elegante: 1 } },
    { key: 'b', label: 'Um curry tailandês bem perfumado', weights: { floral: 3, curva: 1 } },
    { key: 'c', label: 'Massa ao sugo com muito queijo', weights: { frutado: 3, corpo: 1 } },
    { key: 'd', label: 'Costela no fogo de chão', weights: { elegante: 2, frutado: 1, corpo: 3 } },
    { key: 'e', label: 'A cozinha de um país que você nunca visitou', weights: { curva: 3 } },
  ]},
  { id: 'q4', title: 'A sobremesa que você pediria sem olhar o cardápio:', options: [
    { key: 'a', label: 'Torta de limão', weights: { fresco: 3 } },
    { key: 'b', label: 'Algo com flor de laranjeira ou água de rosas', weights: { floral: 3 } },
    { key: 'c', label: 'Pavlova de frutas vermelhas', weights: { frutado: 3 } },
    { key: 'd', label: 'Um quadradinho de chocolate 70%', weights: { elegante: 3, corpo: 2 } },
    { key: 'e', label: 'Doce? Prefiro queijo com mel e pimenta', weights: { curva: 3, corpo: 1 } },
  ]},
  { id: 'q5', title: 'Sábado livre. O plano é...', options: [
    { key: 'a', label: 'Piscina e mais nada', weights: { fresco: 3, frutado: 1 } },
    { key: 'b', label: 'Passear sem pressa por um jardim', weights: { floral: 3 } },
    { key: 'c', label: 'Um brunch que vira almoço', weights: { frutado: 3, floral: 1 } },
    { key: 'd', label: 'Jantar com reserva num lugar que você adora', weights: { elegante: 3, corpo: 1 } },
    { key: 'e', label: 'Ir a um lugar onde você ainda não esteve', weights: { curva: 3, fresco: 1 } },
  ]},
];
