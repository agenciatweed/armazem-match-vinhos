import { PROFILES } from '../src/data/profiles.js';
import { isValidEmail, normalizeEmail } from '../src/lib/email.js';
import type { Channel, CreateLeadPayload, Lead, TrioShown } from '../src/lib/leadTypes.js';
import { computeProfile, parseAnswersKey, type FullAnswers } from '../src/lib/scoring.js';
import { selectTrio } from '../src/lib/selection.js';
import { encodeShare } from '../src/lib/share.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_BODY = 2048;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const isRotation = (r: unknown): r is number => Number.isInteger(r) && (r as number) >= 0 && (r as number) <= 999;
export const isLeadId = (id: unknown): id is string => typeof id === 'string' && UUID.test(id);

export function parseCreate(body: unknown): Result<CreateLeadPayload & { answers: FullAnswers }> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Corpo inválido.' };
  const b = body as Record<string, unknown>;
  if (!isLeadId(b.id)) return { ok: false, error: 'id inválido.' };
  if (typeof b.email !== 'string' || !isValidEmail(b.email)) return { ok: false, error: 'E-mail inválido.' };
  const answers = typeof b.answersKey === 'string' ? parseAnswersKey(b.answersKey) : null;
  if (!answers) return { ok: false, error: 'Respostas inválidas.' };
  if (!isRotation(b.rotation)) return { ok: false, error: 'Rotação inválida.' };
  const channel: Channel = b.channel === 'loja' ? 'loja' : 'online';
  return {
    ok: true,
    value: { id: b.id, email: normalizeEmail(b.email), answersKey: b.answersKey as string, rotation: b.rotation, channel, answers },
  };
}

export function parseRotation(body: unknown): Result<number> {
  const r = (body as Record<string, unknown> | null)?.rotation;
  return isRotation(r) ? { ok: true, value: r } : { ok: false, error: 'Rotação inválida.' };
}

/** O servidor recalcula perfil e trio: nada do cliente além das respostas entra no registro. */
export function buildTrio(answers: FullAnswers, rotation: number, now: string): TrioShown {
  const result = computeProfile(answers);
  return {
    rotation,
    shownAt: now,
    items: selectTrio(result, rotation).map(({ tier, slot, wine }) => ({
      tier,
      slot,
      wineId: wine.id,
      nome: wine.nome,
      tipo: wine.tipo,
      precoReferencia: wine.precoReferencia,
    })),
  };
}

export function buildLead(p: CreateLeadPayload & { answers: FullAnswers }, now: string): Lead {
  const result = computeProfile(p.answers);
  return {
    id: p.id,
    email: p.email,
    profileId: result.profileId,
    profileName: PROFILES[result.profileId].name,
    corpoLevel: result.corpoLevel,
    answersKey: result.answersKey,
    shareCode: encodeShare(p.answers, p.rotation),
    trios: [buildTrio(p.answers, p.rotation, now)],
    channel: p.channel,
    createdAt: now,
    updatedAt: now,
  };
}
