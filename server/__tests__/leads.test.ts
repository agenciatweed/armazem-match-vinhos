import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { computeProfile, parseAnswersKey } from '../../src/lib/scoring.js';
import { selectTrio } from '../../src/lib/selection.js';
import { handleLeadById, handleLeads } from '../handlers.js';
import type { LeadStore } from '../store.js';
import { createFileStore } from '../store-file.js';

const ID = '3f1c2a4e-9b7d-4c1e-8a2b-5d6e7f809a1b';
const KEY = 'q1:a|q2:c|q3:d|q4:b|q5:e';
let store: LeadStore;

const post = (body: unknown) =>
  handleLeads(new Request('http://x/api/leads', { method: 'POST', body: JSON.stringify(body) }), store);
const patch = (id: string, body: unknown) =>
  handleLeadById(new Request(`http://x/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }), id, store);
const valid = { id: ID, email: ' Pessoa@Email.com ', answersKey: KEY, rotation: 0, channel: 'online' };

beforeEach(() => {
  store = createFileStore(join(mkdtempSync(join(tmpdir(), 'leads-')), 'leads.json'));
});

describe('API de matches', () => {
  it('cria o registro com perfil e trio recalculados no servidor', async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    const [lead] = await store.list();
    const result = computeProfile(parseAnswersKey(KEY)!);
    expect(lead.email).toBe('pessoa@email.com');
    expect(lead.profileId).toBe(result.profileId);
    expect(lead.trios[0].items.map((i) => i.wineId)).toEqual(selectTrio(result, 0).map((t) => t.wine.id));
    expect(lead.shareCode).toBe('acdbe-0');
  });

  it('não duplica o mesmo id', async () => {
    await post(valid);
    expect((await post(valid)).status).toBe(200);
    expect(await store.list()).toHaveLength(1);
  });

  it('recusa payloads inválidos', async () => {
    expect((await post({ ...valid, email: 'sem-arroba' })).status).toBe(400);
    expect((await post({ ...valid, answersKey: 'q1:a|q2:c' })).status).toBe(400);
    expect((await post({ ...valid, rotation: -1 })).status).toBe(400);
    expect((await post({ ...valid, id: 'x' })).status).toBe(400);
  });

  it('PATCH acrescenta trio novo e ignora rotação repetida', async () => {
    await post(valid);
    expect((await patch(ID, { rotation: 1 })).status).toBe(200);
    expect((await patch(ID, { rotation: 1 })).status).toBe(200);
    expect((await store.list())[0].trios.map((t) => t.rotation)).toEqual([0, 1]);
    expect((await patch('00000000-0000-4000-8000-000000000000', { rotation: 1 })).status).toBe(404);
  });

  it('lista os mais recentes primeiro e exporta CSV', async () => {
    await post(valid);
    await new Promise((r) => setTimeout(r, 5));
    await post({ ...valid, id: '11111111-2222-4333-8444-555555555555', email: 'outra@email.com' });
    const res = await handleLeads(new Request('http://x/api/leads'), store);
    const { leads } = await res.json();
    expect(leads[0].email).toBe('outra@email.com');
    const bytes = new Uint8Array(await (await handleLeads(new Request('http://x/api/leads?format=csv'), store)).arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes).startsWith('data;email;perfil')).toBe(true);
  });
});
