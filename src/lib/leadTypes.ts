import type { ProfileId } from '../data/questions.js';
import type { Slot, Tier } from '../data/profiles.js';
import type { WineType } from '../data/wines.js';

export type Channel = 'online' | 'loja';

export interface TrioItem {
  tier: Tier;
  slot: Slot;
  wineId: string;
  nome: string;
  tipo: WineType;
  precoReferencia: number | null;
}

export interface TrioShown {
  rotation: number;
  shownAt: string;
  items: TrioItem[];
}

export interface Lead {
  id: string;
  email: string;
  profileId: ProfileId;
  profileName: string;
  corpoLevel: 1 | 2 | 3;
  answersKey: string;
  shareCode: string;
  trios: TrioShown[];
  channel: Channel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  id: string;
  email: string;
  answersKey: string;
  rotation: number;
  channel: Channel;
}
