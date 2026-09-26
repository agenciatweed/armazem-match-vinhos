import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Intro } from './components/Intro.js';
import { Loading } from './components/Loading.js';
import { Question } from './components/Question.js';
import { Result } from './components/Result.js';
import { Shell } from './components/Shell.js';
import { CONFIG } from './data/config.js';
import { QUESTIONS, type OptionKey } from './data/questions.js';
import { appendTrio, saveLead } from './lib/leads.js';
import { clearSession, loadSession, saveSession } from './lib/session.js';
import { computeProfile, isComplete } from './lib/scoring.js';
import { selectTrio } from './lib/selection.js';
import { decodeShare, encodeShare } from './lib/share.js';
import { runViewTransition, supportsViewTransitions, type VtKind } from './lib/viewTransition.js';
import { PROFILES } from './data/profiles.js';
import { answeredCount, initialState, reducer, type QuizState } from './state.js';

const params = new URLSearchParams(window.location.search);
const STORE_MODE = params.get('modo') === 'loja';
const SHARED = decodeShare(params.get('m'));
const IDLE_MS = 90_000;

function boot(): QuizState {
  const saved = loadSession();
  if (SHARED) {
    const base = saved ?? initialState();
    return reducer({ ...base, ageConfirmed: base.ageConfirmed }, { type: 'LOAD_SHARED', ...SHARED });
  }
  return saved ?? initialState();
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, boot);
  const reduced = useReducedMotion();
  const timing = reduced ? { select: 0, out: 120, in: 120, loading: 500 } : { select: 180, out: 280, in: 380, loading: CONFIG.loadingMs };

  const [phase, setPhase] = useState<'idle' | 'leaving' | 'entering'>('idle');
  const [pending, setPending] = useState<OptionKey | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);
  const vtOn = !reduced && supportsViewTransitions();
  const busy = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [announce, setAnnounce] = useState('');

  useEffect(() => saveSession(state), [state]);

  const result = useMemo(() => (isComplete(state.answers) ? computeProfile(state.answers) : null), [state.answers]);
  const trio = useMemo(() => (result ? selectTrio(result, state.rotation) : []), [result, state.rotation]);

  // Transição de pergunta: seleção 180ms, saída 280ms, entrada 380ms; cliques bloqueados.
  const transition = useCallback(
    async (commit: () => void, picked: OptionKey | null, kind: VtKind = 'step', freshIndex: number | null = null) => {
      if (busy.current) return;
      busy.current = true;
      setPending(picked);
      if (picked) await sleep(timing.select);
      if (vtOn) {
        // A caixa marcada voa até o quadrado do progresso (ou, na P5, até a ficha completa).
        await runViewTransition(
          kind,
          () => {
            commit();
            setPending(null);
            setFresh(freshIndex);
          },
          true,
        );
        setFresh(null);
        busy.current = false;
        return;
      }
      setPhase('leaving');
      await sleep(timing.out);
      commit();
      setPending(null);
      setPhase('entering');
      await sleep(timing.in);
      setPhase('idle');
      busy.current = false;
    },
    [timing.select, timing.out, timing.in, vtOn],
  );

  const question = QUESTIONS[state.step];

  const pick = useCallback(
    (key: OptionKey) =>
      transition(
        () => dispatch({ type: 'ANSWER', questionId: question.id, key }),
        key,
        state.step === 4 ? 'final' : 'step',
        state.step === 4 ? null : state.step,
      ),
    [transition, question.id, state.step],
  );
  const back = useCallback(() => transition(() => dispatch({ type: 'BACK' }), null), [transition]);

  // Foco e anúncio a cada pergunta nova.
  useEffect(() => {
    if (state.screen !== 'question') return;
    titleRef.current?.focus({ preventScroll: true });
    setAnnounce(`Pergunta ${state.step + 1} de 5. ${question.title}`);
  }, [state.screen, state.step, question.title]);

  // Teclado: 1 a 5 escolhem, Backspace volta.
  useEffect(() => {
    if (state.screen !== 'question') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        pick(question.options[n - 1].key);
      } else if (e.key === 'Backspace' && state.step > 0) {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.screen, state.step, pick, back, question.options]);

  // Interstício: grava o match em paralelo e segue depois do tempo mínimo.
  useEffect(() => {
    if (state.screen !== 'loading') return;
    if (state.source === 'quiz' && state.leadId && state.email && result) {
      const payload = {
        id: state.leadId,
        email: state.email,
        answersKey: result.answersKey,
        rotation: 0,
        channel: STORE_MODE ? ('loja' as const) : ('online' as const),
      };
      void saveLead(payload).then((ok) => dispatch(ok ? { type: 'LEAD_SAVED' } : { type: 'LEAD_FAILED', payload }));
    }
    const t = setTimeout(() => {
      // Revelação: a ficha vira o perfil, o carimbo assenta e as garrafas vão para os cards.
      void runViewTransition(
        'reveal',
        () => {
          setArrived(vtOn);
          dispatch({ type: 'FINISH_LOADING' });
        },
        vtOn,
      );
    }, timing.loading);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen]);

  // Link compartilhável no resultado.
  useEffect(() => {
    if (state.screen !== 'result' || !isComplete(state.answers)) return;
    const next = new URLSearchParams();
    next.set('m', encodeShare(state.answers, state.rotation));
    if (STORE_MODE) next.set('modo', 'loja');
    history.replaceState(null, '', `${location.pathname}?${next}`);
  }, [state.screen, state.answers, state.rotation]);

  // Reenvio de registro pendente na próxima ação.
  const retryPending = useCallback(() => {
    if (!state.pendingLead) return;
    const payload = state.pendingLead;
    void saveLead(payload, false).then((ok) => ok && dispatch({ type: 'LEAD_SAVED' }));
  }, [state.pendingLead]);

  const nextTrio = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    retryPending();
    setSwapping(true);
    await sleep(timing.out);
    const rotation = (state.rotation + 1) % 1000;
    dispatch({ type: 'NEXT_TRIO' });
    if (state.leadId && state.source === 'quiz') appendTrio(state.leadId, rotation);
    setSwapping(false);
    await sleep(timing.in);
    busy.current = false;
  }, [retryPending, timing.out, timing.in, state.rotation, state.leadId, state.source]);

  const leaveToIntro = useCallback((hard: boolean) => {
    if (hard) clearSession();
    history.replaceState(null, '', STORE_MODE ? `${location.pathname}?modo=loja` : location.pathname);
    dispatch({ type: hard ? 'HARD_RESET' : 'RESET' });
    window.scrollTo(0, 0);
  }, []);

  // Modo loja: 90s sem interação no resultado volta ao início e apaga tudo, inclusive o e-mail.
  useEffect(() => {
    if (!STORE_MODE || state.screen !== 'result') return;
    let timer = setTimeout(() => leaveToIntro(true), IDLE_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => leaveToIntro(true), IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [state.screen, leaveToIntro]);

  useEffect(() => {
    if (state.screen === 'result' || state.screen === 'question') window.scrollTo(0, 0);
  }, [state.screen]);

  let body;
  if (state.screen === 'intro') {
    body = (
      <Intro
        shared={state.source === 'shared'}
        storeMode={STORE_MODE}
        savedEmail={state.email}
        onConfirm={(email) => {
          dispatch({ type: 'CONFIRM_AGE', email });
          if (state.source === 'shared') dispatch({ type: 'LOAD_SHARED', answers: state.answers, rotation: state.rotation });
          else void runViewTransition('sheet', () => dispatch({ type: 'START' }), vtOn);
        }}
        onChangeEmail={() => dispatch({ type: 'CHANGE_EMAIL' })}
      />
    );
  } else if (state.screen === 'question') {
    body = (
      <Question
        ref={titleRef}
        question={question}
        step={state.step}
        selected={state.answers[question.id]}
        pending={pending}
        phase={phase}
        answered={answeredCount(state.answers)}
        fresh={fresh}
        onPick={pick}
        onBack={state.step > 0 ? back : null}
      />
    );
  } else if (state.screen === 'loading') {
    body = result ? (
      <Loading durationMs={timing.loading} accent={PROFILES[result.profileId].accent} trio={trio} />
    ) : null;
  } else if (result) {
    body = (
      <Result
        result={result}
        trio={trio}
        shared={state.source === 'shared'}
        storeMode={STORE_MODE}
        swapping={swapping}
        arrived={arrived}
        onNextTrio={nextTrio}
        onRestart={() => leaveToIntro(false)}
        onDiscoverOwn={() => leaveToIntro(true)}
        onInteract={retryPending}
      />
    );
  }

  return (
    <Shell wide={state.screen === 'result'}>
      {body}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </Shell>
  );
}
