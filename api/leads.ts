import { handleLeads } from '../server/handlers.js';

export function GET(req: Request) {
  return handleLeads(req);
}

export function POST(req: Request) {
  return handleLeads(req);
}
