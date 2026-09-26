import { leadsToCsv } from '../src/lib/csv.js';
import { parseAnswersKey } from '../src/lib/scoring.js';
import { getStore, StoreUnavailableError, type LeadStore } from './store.js';
import { buildLead, buildTrio, isLeadId, MAX_BODY, parseCreate, parseRotation } from './validate.js';

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function readBody(req: Request): Promise<unknown> {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new Error('too_large');
  return JSON.parse(text);
}

async function withStore(injected: LeadStore | undefined, fn: (s: LeadStore) => Promise<Response>) {
  try {
    return await fn(injected ?? (await getStore()));
  } catch (err) {
    if (err instanceof StoreUnavailableError) return json(503, { error: 'Banco de dados não configurado.' });
    console.error('leads api error', err instanceof Error ? err.message : 'unknown');
    return json(500, { error: 'Erro interno.' });
  }
}

/** /api/leads: POST cria, GET lista (JSON ou ?format=csv). */
export async function handleLeads(req: Request, store?: LeadStore): Promise<Response> {
  if (req.method === 'GET') {
    return withStore(store, async (s) => {
      const leads = await s.list();
      const url = new URL(req.url);
      if (url.searchParams.get('format') === 'csv') {
        return new Response(leadsToCsv(leads, url.origin), {
          headers: {
            ...BASE_HEADERS,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="matches-armazem.csv"',
          },
        });
      }
      return json(200, { leads, storage: s.kind });
    });
  }
  if (req.method === 'POST') {
    let body: unknown;
    try {
      body = await readBody(req);
    } catch {
      return json(400, { error: 'Corpo inválido.' });
    }
    const parsed = parseCreate(body);
    if (!parsed.ok) return json(400, { error: parsed.error });
    return withStore(store, async (s) => {
      const outcome = await s.create(buildLead(parsed.value, new Date().toISOString()));
      return json(outcome === 'created' ? 201 : 200, { id: parsed.value.id, status: outcome });
    });
  }
  return new Response(null, { status: 405, headers: { ...BASE_HEADERS, Allow: 'GET, POST' } });
}

/** /api/leads/{id}: PATCH acrescenta o trio de uma nova rotação. */
export async function handleLeadById(req: Request, id: string, store?: LeadStore): Promise<Response> {
  if (req.method !== 'PATCH') return new Response(null, { status: 405, headers: { ...BASE_HEADERS, Allow: 'PATCH' } });
  if (!isLeadId(id)) return json(400, { error: 'id inválido.' });
  let body: unknown;
  try {
    body = await readBody(req);
  } catch {
    return json(400, { error: 'Corpo inválido.' });
  }
  const rotation = parseRotation(body);
  if (!rotation.ok) return json(400, { error: rotation.error });
  return withStore(store, async (s) => {
    const existing = await s.get(id);
    if (!existing) return json(404, { error: 'Registro não encontrado.' });
    const answers = parseAnswersKey(existing.answersKey)!;
    const outcome = await s.appendTrio(id, buildTrio(answers, rotation.value, new Date().toISOString()));
    return outcome === 'ok' ? json(200, { id, status: 'ok' }) : json(404, { error: 'Registro não encontrado.' });
  });
}
