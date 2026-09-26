import { QUESTIONS, type OptionKey, type ProfileId } from '../data/questions.js';

export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
export type Answers = Partial<Record<QuestionId, OptionKey>>;
export type FullAnswers = Record<QuestionId, OptionKey>;

export interface ProfileResult {
  profileId: ProfileId;
  scores: Record<ProfileId, number>;
  corpo: number;
  corpoLevel: 1 | 2 | 3;
  answersKey: string;
  tieBroken: boolean;
}

export const PROFILE_IDS: ProfileId[] = ['fresco', 'floral', 'frutado', 'elegante', 'curva'];
export const QUESTION_IDS: QuestionId[] = ['q1', 'q2', 'q3', 'q4', 'q5'];
export const OPTION_KEYS: OptionKey[] = ['a', 'b', 'c', 'd', 'e'];
const TIE_PRIORITY: QuestionId[] = ['q3', 'q4', 'q2', 'q1', 'q5'];
const FALLBACK_ORDER: ProfileId[] = ['frutado', 'fresco', 'elegante', 'floral', 'curva'];

export function isComplete(answers: Answers): answers is FullAnswers {
  return QUESTION_IDS.every((q) => !!answers[q] && OPTION_KEYS.includes(answers[q]!));
}

export function toAnswersKey(answers: FullAnswers): string {
  return QUESTION_IDS.map((q) => `${q}:${answers[q]}`).join('|');
}

export function parseAnswersKey(key: string): FullAnswers | null {
  if (typeof key !== 'string') return null;
  const parts = key.split('|');
  if (parts.length !== 5) return null;
  const out: Answers = {};
  for (let i = 0; i < 5; i++) {
    const [q, k] = parts[i].split(':');
    if (q !== QUESTION_IDS[i] || !OPTION_KEYS.includes(k as OptionKey)) return null;
    out[q as QuestionId] = k as OptionKey;
  }
  return out as FullAnswers;
}

function weightsFor(q: QuestionId, key: OptionKey) {
  const question = QUESTIONS.find((x) => x.id === q)!;
  return question.options.find((o) => o.key === key)!.weights;
}

/** O perfil que a resposta favorece como principal (maior peso). */
function favoredProfile(q: QuestionId, key: OptionKey): ProfileId {
  const w = weightsFor(q, key);
  let best: ProfileId = PROFILE_IDS[0];
  let bestV = -1;
  for (const p of PROFILE_IDS) {
    const v = w[p] ?? 0;
    if (v > bestV) {
      best = p;
      bestV = v;
    }
  }
  return best;
}

export function computeProfile(answers: FullAnswers): ProfileResult {
  const scores = { fresco: 0, floral: 0, frutado: 0, elegante: 0, curva: 0 } as Record<ProfileId, number>;
  let corpo = 0;
  for (const q of QUESTION_IDS) {
    const w = weightsFor(q, answers[q]);
    for (const p of PROFILE_IDS) scores[p] += w[p] ?? 0;
    corpo += w.corpo ?? 0;
  }
  const max = Math.max(...PROFILE_IDS.map((p) => scores[p]));
  const tied = PROFILE_IDS.filter((p) => scores[p] === max);
  let profileId: ProfileId = tied[0];
  let tieBroken = false;
  if (tied.length > 1) {
    tieBroken = true;
    const byQuestion = TIE_PRIORITY.map((q) => favoredProfile(q, answers[q])).find((p) => tied.includes(p));
    profileId = byQuestion ?? FALLBACK_ORDER.find((p) => tied.includes(p))!;
  }
  const corpoLevel: 1 | 2 | 3 = corpo <= 1 ? 1 : corpo <= 3 ? 2 : 3;
  return { profileId, scores, corpo, corpoLevel, answersKey: toAnswersKey(answers), tieBroken };
}
