import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const HIGH_RISK = ['publish', 'email', 'spend'];

async function runTask(svc, task) {
  const stamp = (event) => [...(task.history || []), { at: new Date().toISOString(), event, by: task.agent_name || 'Agent' }];
  const needsApproval = HIGH_RISK.includes(task.action_type) && task.status !== 'approved';
  if (needsApproval) {
    await svc.entities.AgentTask.update(task.id, { status: 'awaiting_approval', risk: 'high', history: stamp('Waiting for your approval') });
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
      prompt: `You are ${task.agent_name || 'a Write Vibe AI agent'}, working autonomously for an author on the Write Vibe publishing platform (area: ${task.area}).
Complete this task fully and return the finished work in clear markdown, ready for the author to use. End with a short "Next steps" list.

Task: ${task.title}
Instructions: ${task.instructions || 'Use your best judgment.'}${bookContext}`
    });
    await svc.entities.AgentTask.update(task.id, { status: 'completed', output: String(output), completed_at: new Date().toISOString(), error: '', history: stamp('Completed') });
    return 'completed';
  } catch (e) {
    await svc.entities.AgentTask.update(task.id, { status: 'failed', error: e.message, history: stamp('Failed') });
    return 'failed';
  }
}

export default async function(req) {
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
      if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
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