import { describe, expect, it } from 'vitest';
import type { OptionKey, ProfileId } from '../../data/questions.js';
import { computeProfile, OPTION_KEYS, PROFILE_IDS, QUESTION_IDS, type FullAnswers } from '../scoring.js';
import { selectTrio } from '../selection.js';

function all(): FullAnswers[] {
  const out: FullAnswers[] = [];
  const rec = (i: number, acc: OptionKey[]) => {
    if (i === 5) {
      const a = {} as FullAnswers;
      QUESTION_IDS.forEach((q, j) => (a[q] = acc[j]));
      out.push(a);
      return;
    }
    for (const k of OPTION_KEYS) rec(i + 1, [...acc, k]);
  };
  rec(0, []);
  return out;
}

const same = (k: OptionKey): FullAnswers => ({ q1: k, q2: k, q3: k, q4: k, q5: k });

describe('computeProfile', () => {
  it('distribui as 3.125 combinações entre 15% e 25% por perfil', () => {
    const combos = all();
    expect(combos).toHaveLength(3125);
    const counts = Object.fromEntries(PROFILE_IDS.map((p) => [p, 0])) as Record<ProfileId, number>;
    for (const a of combos) counts[computeProfile(a).profileId]++;
    for (const p of PROFILE_IDS) {
      expect(counts[p] / 3125).toBeGreaterThanOrEqual(0.15);
      expect(counts[p] / 3125).toBeLessThanOrEqual(0.25);
    }
  });

  it('casos fixos', () => {
    expect(computeProfile(same('a')).profileId).toBe('fresco');
    expect(computeProfile(same('b')).profileId).toBe('floral');
    expect(computeProfile(same('c')).profileId).toBe('frutado');
    const d = computeProfile(same('d'));
    expect(d.profileId).toBe('elegante');
    expect(d.corpoLevel).toBe(3);
    expect(computeProfile(same('e')).profileId).toBe('curva');
  });
});

describe('selectTrio', () => {
  it('sempre um tinto, um branco e um adicional, de forma determinística', () => {
    for (const a of all()) {
      const r = computeProfile(a);
      const trio = selectTrio(r, 0);
      expect(trio.map((t) => t.slot).sort()).toEqual(['adicional', 'branco', 'tinto']);
      expect(trio.map((t) => t.tier)).toEqual(['seguro', 'descoberta', 'surpresa']);
      expect(selectTrio(r, 0).map((t) => t.wine.id)).toEqual(trio.map((t) => t.wine.id));
    }
  });

  it('d,d,d,d,d coloca o tinto como O SEGURO', () => {
    expect(selectTrio(computeProfile(same('d')), 0)[0].slot).toBe('tinto');
  });
});
