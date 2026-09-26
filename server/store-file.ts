import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Lead } from '../src/lib/leadTypes.js';
import { sortRecent, type LeadStore } from './store.js';

/** Adaptador de desenvolvimento: um único arquivo JSON, escrita atômica. */
export function createFileStore(file: string): LeadStore {
  let queue: Promise<unknown> = Promise.resolve();

  async function readAll(): Promise<Lead[]> {
    try {
      return JSON.parse(await readFile(file, 'utf8')) as Lead[];
    } catch {
      return [];
    }
  }

  async function writeAll(leads: Lead[]) {
    await mkdir(dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    await writeFile(tmp, JSON.stringify(leads, null, 2), 'utf8');
    await rename(tmp, file);
  }

  // Serializa as escritas para não perder registros em requisições simultâneas.
  function locked<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    kind: 'file',
    create: (lead) =>
      locked(async () => {
        const all = await readAll();
        if (all.some((l) => l.id === lead.id)) return 'exists' as const;
        all.push(lead);
        await writeAll(all);
        return 'created' as const;
      }),
    appendTrio: (id, trio) =>
      locked(async () => {
        const all = await readAll();
        const lead = all.find((l) => l.id === id);
        if (!lead) return 'not_found' as const;
        if (!lead.trios.some((t) => t.rotation === trio.rotation)) {
          lead.trios.push(trio);
          lead.updatedAt = trio.shownAt;
          await writeAll(all);
        }
        return 'ok' as const;
      }),
    get: async (id) => (await readAll()).find((l) => l.id === id) ?? null,
    list: async () => sortRecent(await readAll()),
  };
}
