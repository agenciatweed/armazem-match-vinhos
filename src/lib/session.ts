import { initialState, type QuizState } from '../state.js';
import { isValidEmail } from './email.js';
import { OPTION_KEYS, QUESTION_IDS } from './scoring.js';

const KEY = 'armazem-match-do-vinho:v2';
const OLD_KEY = 'armazem-match-do-vinho:v1';
const SCREENS = ['intro', 'question', 'loading', 'result'];

function valid(s: unknown): s is QuizState {
  if (!s || typeof s !== 'object') return false;
  const q = s as QuizState;
  if (q.version !== 2 || typeof q.ageConfirmed !== 'boolean') return false;
  if (q.email !== null && !isValidEmail(q.email)) return false;
  if (!SCREENS.includes(q.screen) || ![0, 1, 2, 3, 4].includes(q.step)) return false;
  if (!Number.isInteger(q.rotation) || q.rotation < 0) return false;
  if (q.source !== 'quiz' && q.source !== 'shared') return false;
  if (!q.answers || typeof q.answers !== 'object') return false;
  for (const [k, v] of Object.entries(q.answers)) {
    if (!QUESTION_IDS.includes(k as never) || !OPTION_KEYS.includes(v as never)) return false;
  }
  if ((q.screen === 'result' || q.screen === 'loading') && Object.keys(q.answers).length !== 5) return false;
  if (q.screen !== 'intro' && q.source === 'quiz' && !q.email) return false;
  return true;
}

export function loadSession(): QuizState | null {
  try {
    sessionStorage.removeItem(OLD_KEY);
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!valid(parsed)) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    // Interstício interrompido: vai direto ao resultado.
    return parsed.screen === 'loading' ? { ...parsed, screen: 'result' } : parsed;
  } catch {
    return null;
  }
}

export function saveSession(state: QuizState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Modo privado ou armazenamento cheio: segue só em memória.
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignora */
  }
}

export const freshState = initialState;
