import type { OptionKey } from '../data/questions.js';
import { QUESTION_IDS, type FullAnswers } from './scoring.js';

/** Código do link compartilhável: cinco respostas e a rotação, ex. "acdbe-0". */
export function encodeShare(answers: FullAnswers, rotation: number): string {
  return QUESTION_IDS.map((q) => answers[q]).join('') + '-' + rotation;
}

export function decodeShare(code: string | null): { answers: FullAnswers; rotation: number } | null {
  if (!code) return null;
  const m = /^([a-e]{5})-(\d{1,3})$/.exec(code);
  if (!m) return null;
  const answers = {} as FullAnswers;
  QUESTION_IDS.forEach((q, i) => (answers[q] = m[1][i] as OptionKey));
  return { answers, rotation: Number(m[2]) };
}
