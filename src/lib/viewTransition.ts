import { flushSync } from 'react-dom';

export type VtKind = 'sheet' | 'step' | 'final' | 'reveal';

export const supportsViewTransitions = () =>
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

/**
 * Roda uma atualização de estado dentro de uma View Transition.
 * O tipo fica em <html data-vt> durante a transição inteira, para o CSS
 * nomear só os elementos que participam daquela coreografia.
 * Sem suporte (ou com movimento reduzido), aplica a atualização direto.
 */
export async function runViewTransition(kind: VtKind, update: () => void, enabled: boolean): Promise<boolean> {
  if (!enabled || !supportsViewTransitions()) {
    update();
    return false;
  }
  const root = document.documentElement;
  root.dataset.vt = kind;
  try {
    const t = document.startViewTransition(() => flushSync(update));
    await t.finished;
    return true;
  } catch {
    return true;
  } finally {
    if (root.dataset.vt === kind) delete root.dataset.vt;
  }
}
