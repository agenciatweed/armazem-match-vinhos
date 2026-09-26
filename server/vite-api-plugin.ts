import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { handleLeadById, handleLeads } from './handlers.js';

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
}

async function send(res: ServerResponse, r: Response) {
  res.statusCode = r.status;
  r.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await r.arrayBuffer()));
}

/** Monta as mesmas funções de api/ no servidor de desenvolvimento, com o banco em arquivo local. */
export function apiDevPlugin(): Plugin {
  return {
    name: 'match-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (path === '/api/leads') return send(res, await handleLeads(await toRequest(req)));
        const m = /^\/api\/leads\/([^/]+)$/.exec(path);
        if (m) return send(res, await handleLeadById(await toRequest(req), m[1]));
        next();
      });
    },
  };
}
