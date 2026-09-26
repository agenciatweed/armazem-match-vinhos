import { handleLeadById } from '../../server/handlers.js';

export function PATCH(req: Request) {
  const id = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';
  return handleLeadById(req, id);
}
