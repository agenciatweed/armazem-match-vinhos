import { PROFILES, type Slot, type Tier } from '../data/profiles.js';
import { WINES, type Wine } from '../data/wines.js';
import { fnv1a } from './hash.js';
import type { ProfileResult } from './scoring.js';

export interface TrioEntry {
  tier: Tier;
  slot: Slot;
  wine: Wine;
}

export const TIER_ORDER: Tier[] = ['seguro', 'descoberta', 'surpresa'];

/** Faixas do perfil depois da regra de corpo (spec 6.3). */
export function resolveTiers(result: ProfileResult): Record<Tier, Slot> {
  const tiers = { ...PROFILES[result.profileId].tiers };
  if (result.corpoLevel === 3 && tiers.seguro !== 'tinto') {
    const tintoTier = TIER_ORDER.find((t) => tiers[t] === 'tinto')!;
    tiers[tintoTier] = tiers.seguro;
    tiers.seguro = 'tinto';
  }
  return tiers;
}

function tintoPool(result: ProfileResult): Wine[] {
  const all = WINES[result.profileId].tinto;
  const exact = all.filter((w) => w.corpo === result.corpoLevel);
  if (exact.length) return exact;
  const levels = [...new Set(all.map((w) => w.corpo))].sort(
    (a, b) => Math.abs(a - result.corpoLevel) - Math.abs(b - result.corpoLevel) || a - b,
  );
  return all.filter((w) => w.corpo === levels[0]);
}

function pick(pool: Wine[], seed: string, rotation: number): Wine {
  return pool[(fnv1a(seed) + rotation) % pool.length];
}

export function selectTrio(result: ProfileResult, rotation: number): TrioEntry[] {
  const tiers = resolveTiers(result);
  const bySlot: Record<Slot, Wine> = {
    tinto: pick(tintoPool(result), result.answersKey + '|tinto', rotation),
    branco: pick(WINES[result.profileId].branco, result.answersKey + '|branco', rotation),
    adicional: pick(WINES[result.profileId].adicional, result.answersKey + '|adicional', rotation),
  };
  return TIER_ORDER.map((tier) => ({ tier, slot: tiers[tier], wine: bySlot[tiers[tier]] }));
}
