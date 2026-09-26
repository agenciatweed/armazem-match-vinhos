import type { OptionKey } from './data/questions.js';
import type { CreateLeadPayload } from './lib/leadTypes.js';
import { QUESTION_IDS, type Answers, type QuestionId } from './lib/scoring.js';

export type Screen = 'intro' | 'question' | 'loading' | 'result';
export type Step = 0 | 1 | 2 | 3 | 4;

export interface QuizState {
  version: 2;
  ageConfirmed: boolean;
  email: string | null;
  screen: Screen;
  step: Step;
  answers: Answers;
  rotation: number;
  leadId: string | null;
  pendingLead?: CreateLeadPayload;
  source: 'quiz' | 'shared';
  startedAt: string;
  completedAt?: string;
}

export type Action =
  | { type: 'CONFIRM_AGE'; email: string | null }
  | { type: 'START' }
  | { type: 'ANSWER'; questionId: QuestionId; key: OptionKey }
  | { type: 'BACK' }
  | { type: 'FINISH_LOADING' }
  | { type: 'NEXT_TRIO' }
  | { type: 'LEAD_SAVED' }
  | { type: 'LEAD_FAILED'; payload: CreateLeadPayload }
  | { type: 'CHANGE_EMAIL' }
  | { type: 'RESET' }
  | { type: 'HARD_RESET' }
  | { type: 'LOAD_SHARED'; answers: Answers; rotation: number };

export function initialState(): QuizState {
  return {
    version: 2,
    ageConfirmed: false,
    email: null,
    screen: 'intro',
    step: 0,
    answers: {},
    rotation: 0,
    leadId: null,
    source: 'quiz',
    startedAt: new Date().toISOString(),
  };
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback para navegadores antigos (uuid v4 com Math.random).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'CONFIRM_AGE':
      if (state.source === 'shared') return { ...state, ageConfirmed: true };
      if (!action.email) return state;
      return { ...state, ageConfirmed: true, email: action.email };
    case 'START':
      if (!state.email || !state.ageConfirmed) return state;
      return { ...state, screen: 'question', step: 0, startedAt: new Date().toISOString() };
    case 'ANSWER': {
      const answers = { ...state.answers, [action.questionId]: action.key };
      if (state.step === 4) {
        return {
          ...state,
          answers,
          screen: 'loading',
          leadId: newId(),
          rotation: 0,
          completedAt: new Date().toISOString(),
        };
      }
      return { ...state, answers, step: (state.step + 1) as Step };
    }
    case 'BACK':
      if (state.screen !== 'question' || state.step === 0) return state;
      return { ...state, step: (state.step - 1) as Step };
    case 'FINISH_LOADING':
      return state.screen === 'loading' ? { ...state, screen: 'result' } : state;
    case 'NEXT_TRIO':
      return { ...state, rotation: (state.rotation + 1) % 1000 };
    case 'LEAD_SAVED':
      return { ...state, pendingLead: undefined };
    case 'LEAD_FAILED':
      return { ...state, pendingLead: action.payload };
    case 'CHANGE_EMAIL':
      return { ...state, email: null, screen: 'intro' };
    case 'RESET':
      return { ...initialState(), ageConfirmed: state.ageConfirmed, email: state.email };
    case 'HARD_RESET':
      return initialState();
    case 'LOAD_SHARED':
      return {
        ...state,
        source: 'shared',
        answers: action.answers,
        rotation: action.rotation,
        leadId: null,
        pendingLead: undefined,
        screen: state.ageConfirmed ? 'result' : 'intro',
      };
    default:
      return state;
  }
}

export const answeredCount = (answers: Answers) => QUESTION_IDS.filter((q) => answers[q]).length;
