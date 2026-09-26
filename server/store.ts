import type { Lead, TrioShown } from '../src/lib/leadTypes.js';

export interface LeadStore {
  kind: 'file' | 'blob';
  create(lead: Lead): Promise<'created' | 'exists'>;
  get(id: string): Promise<Lead | null>;
  appendTrio(id: string, trio: TrioShown): Promise<'ok' | 'not_found'>;
  /** Mais recentes primeiro. */
  list(): Promise<Lead[]>;
}

export const LIST_LIMIT = 2000;

export class StoreUnavailableError extends Error {}

let cached: LeadStore | null = null;

/** Blob quando a Vercel injeta o token; arquivo local no desenvolvimento. */
export async function getStore(): Promise<LeadStore> {
  if (cached) return cached;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { createBlobStore } = await import('./store-blob.js');
    cached = createBlobStore();
  } else if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
    throw new StoreUnavailableError('Banco de dados não configurado.');
  } else {
    const { createFileStore } = await import('./store-file.js');
    cached = createFileStore(process.env.LEADS_FILE ?? '.data/leads.json');
  }
  return cached;
}

export function sortRecent(leads: Lead[]): Lead[] {
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, LIST_LIMIT);
}
