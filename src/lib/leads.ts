import type { CreateLeadPayload } from './leadTypes.js';

async function send(url: string, method: 'POST' | 'PATCH', body: unknown, timeoutMs = 8000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Grava o match; uma nova tentativa depois de 3s. Nunca lança erro. */
export async function saveLead(payload: CreateLeadPayload, retry = true): Promise<boolean> {
  if (await send('/api/leads', 'POST', payload)) return true;
  if (!retry) return false;
  await wait(3000);
  const ok = await send('/api/leads', 'POST', payload);
  if (!ok) console.warn('Match não registrado; nova tentativa na próxima ação.');
  return ok;
}

/** Acrescenta um trio visto ao registro, em segundo plano. */
export function appendTrio(leadId: string, rotation: number) {
  void send(`/api/leads/${leadId}`, 'PATCH', { rotation });
}
