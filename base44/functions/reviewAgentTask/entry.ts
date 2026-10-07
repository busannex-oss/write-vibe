import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { reviewTask, recordAdminDecision } from '../../shared/approvalReview.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { action, taskId, decision, note } = await req.json();
    const svc = base44.asServiceRole;
    const task = await svc.entities.AgentTask.get(taskId);

    if (action === 'review') return Response.json(await reviewTask(svc, task));
    if (action === 'decide') {
      await recordAdminDecision(svc, task, decision, note, user.full_name || 'Administrator');
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});