import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { reviewTask } from '../../shared/approvalReview.ts';
import { withGuard } from '../../shared/guard.ts';
import { routeArea } from '../../shared/agentRouting.ts';

const HIGH_RISK = ['publish', 'email', 'spend'];

async function runTask(svc, original) {
  // Route every task to its owning agent and team reviewer before work starts
  const route = routeArea(original.area, HIGH_RISK.includes(original.action_type));
  const task = { ...original, agent_key: original.agent_key || route.owner_key, agent_name: original.agent_name || route.owner };
  if (!original.reviewer_agent) {
    const history = [...(task.history || []), { at: new Date().toISOString(), event: `Routed to ${task.agent_name}; ${route.reviewer} reviews; ${route.observers.join(', ')} informed`, by: 'Agent Router' }];
    await svc.entities.AgentTask.update(task.id, { agent_key: task.agent_key, agent_name: task.agent_name, reviewer_agent: route.reviewer, observers: route.observers, history });
    task.history = history;
  }
  const stamp = (event) => [...(task.history || []), { at: new Date().toISOString(), event, by: task.agent_name || 'Agent' }];
  const needsApproval = HIGH_RISK.includes(task.action_type) && task.status !== 'approved';
  if (needsApproval) {
    const history = stamp('Sent to Alexandar Sterling and Rose McLaurin for review');
    await svc.entities.AgentTask.update(task.id, { status: 'awaiting_approval', risk: 'high', history });
    if (!task.reviews?.length) await reviewTask(svc, { ...task, history });
    return 'awaiting_approval';
  }
  await svc.entities.AgentTask.update(task.id, { status: 'running' });
  try {
    let bookContext = '';
    if (task.book_id) {
      const [book] = await svc.entities.Book.filter({ id: task.book_id });
      if (book) bookContext = `\n\nBook context:\nTitle: ${book.title}\nGenre: ${book.category || ''}\nSummary: ${book.plot_summary || book.book_summary || ''}\nStatus: ${book.status}`;
    }
    const output = await svc.integrations.Core.InvokeLLM({
      prompt: `You are ${task.agent_name}, ${route.role} on the Write Vibe publishing platform, working autonomously for an author (area: ${task.area}).
Your responsibilities: ${route.responsibilities}
Your work will be reviewed by ${route.reviewer}. If any part of the task falls outside your responsibilities, say which specialist should handle it instead of guessing.
Complete this task fully and return the finished work in clear markdown, ready for the author to use. End with a short "Next steps" list.

Task: ${task.title}
Instructions: ${task.instructions || 'Use your best judgment.'}${bookContext}`
    });
    await svc.entities.AgentTask.update(task.id, { status: 'completed', output: String(output), completed_at: new Date().toISOString(), error: '', history: stamp(`Completed; sent to ${route.reviewer} for review`) });
    return 'completed';
  } catch (e) {
    await svc.entities.AgentTask.update(task.id, { status: 'failed', error: e.message, history: stamp('Failed') });
    return 'failed';
  }
}

const guarded = withGuard('runAgentTasks', 60, handler, 'agent_action');

export default async function(req) {
  return guarded(req);
}

async function handler(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { user = null; }
    const svc = base44.asServiceRole;

    let tasks;
    if (body.taskId) {
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const [t] = await svc.entities.AgentTask.filter({ id: body.taskId });
      if (!t) return Response.json({ error: 'Not found' }, { status: 404 });
      if (t.created_by !== user.email && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      tasks = [t];
    } else {
      if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      tasks = await svc.entities.AgentTask.filter({ status: { $in: ['queued', 'approved'] } }, 'created_date', 10);
    }

    const results = [];
    for (let i = 0; i < tasks.length; i += 5) {
      const batch = await Promise.allSettled(tasks.slice(i, i + 5).map((t) => runTask(svc, t)));
      results.push(...batch.map((r) => (r.status === 'fulfilled' ? r.value : 'failed')));
    }
    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}