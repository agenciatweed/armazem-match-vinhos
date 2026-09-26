import { get, list, put } from '@vercel/blob';
import type { Lead } from '../src/lib/leadTypes.js';
import { LIST_LIMIT, sortRecent, type LeadStore } from './store.js';

const PREFIX = 'leads/';
const path = (id: string) => `${PREFIX}${id}.json`;

async function readLead(pathname: string): Promise<Lead | null> {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  const text = await new Response(res.stream).text();
  try {
    return JSON.parse(text) as Lead;
  } catch {
    return null;
  }
}

async function writeLead(lead: Lead) {
  await put(path(lead.id), JSON.stringify(lead), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Adaptador de produção: um arquivo privado por match no Vercel Blob. */
export function createBlobStore(): LeadStore {
  return {
    kind: 'blob',
    async create(lead) {
      if (await readLead(path(lead.id))) return 'exists';
      await writeLead(lead);
      return 'created';
    },
    get: (id) => readLead(path(id)),
    async appendTrio(id, trio) {
      const lead = await readLead(path(id));
      if (!lead) return 'not_found';
      if (!lead.trios.some((t) => t.rotation === trio.rotation)) {
        lead.trios.push(trio);
        lead.updatedAt = trio.shownAt;
        await writeLead(lead);
      }
      return 'ok';
    },
    async list() {
      const pathnames: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
        pathnames.push(...page.blobs.map((b) => b.pathname));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor && pathnames.length < LIST_LIMIT);

      const leads: Lead[] = [];
      for (let i = 0; i < pathnames.length; i += 8) {
        const batch = await Promise.all(pathnames.slice(i, i + 8).map(readLead));
        for (const l of batch) if (l) leads.push(l);
      }
      return sortRecent(leads);
    },
  };
}
