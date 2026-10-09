import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { waitUntil } from 'base44:runtime';

// Shared rate limiting + tracing for backend functions.
// Limits are counted from stored SystemTrace events, so they hold across
// every server instance (not just one in-memory worker).
// Admins and scheduled/system runs (no signed-in user) are never limited.
export function withGuard(
  source: string,
  perHour: number,
  handler: (req: Request) => Promise<Response>,
  kind: 'function_call' | 'agent_action' = 'function_call',
) {
  return async (req: Request): Promise<Response> => {
    const started = Date.now();
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities.SystemTrace;
    const user = await base44.auth.me().catch(() => null);
    const body = await req.clone().json().catch(() => ({}));
    const trace_id = String(body?.trace_id || crypto.randomUUID()).slice(0, 64);
    const base = { trace_id, source, user_id: user?.id, user_email: user?.email };

    if (user && user.role !== 'admin') {
      const since = new Date(Date.now() - 3600_000).toISOString();
      const used = await svc.count({ source, user_id: user.id, kind, created_date: { $gte: since } });
      if (used >= perHour) {
        waitUntil(svc.create({ ...base, kind: 'rate_limited', status: 'blocked', message: `Limit ${perHour}/hour reached` }));
        return Response.json({ error: 'Too many requests. Please try again in a little while.' }, { status: 429 });
      }
    }

    let res: Response;
    try {
      res = await handler(req);
    } catch (e) {
      res = Response.json({ error: (e as Error).message }, { status: 500 });
    }
    const failed = res.status >= 400;
    let message = '';
    if (failed) message = (await res.clone().text().catch(() => '')).slice(0, 500);
    waitUntil(svc.create({ ...base, kind, status: failed ? 'error' : 'ok', duration_ms: Date.now() - started, message }));
    if (failed && res.status >= 500) {
      waitUntil(svc.create({ ...base, kind: 'error', status: 'error', message }));
    }
    return res;
  };
}