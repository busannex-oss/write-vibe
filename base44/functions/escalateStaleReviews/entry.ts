import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { FOUNDER_EMAIL } from '../../shared/founder.ts';

// Notifies the Chief of Staff (Alexandar Sterling) about tasks stuck in review for 48+ hours.
const CHIEF_OF_STAFF = { key: 'personal_executive_assistant', name: 'Alexandar Sterling' };
const MARK = 'Escalated to Chief of Staff';
const esc = (s: unknown) => String(s || '').replace(/</g, '&lt;');

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const svc = base44.asServiceRole;
    const cutoff = Date.now() - 48 * 3600 * 1000;

    const tasks = await svc.entities.AgentTask.filter({ status: 'awaiting_approval' }, 'updated_date', 200);
    const stale = tasks.filter((t: any) =>
      new Date(t.updated_date).getTime() < cutoff && !(t.history || []).some((h: any) => h.event === MARK));
    if (!stale.length) return Response.json({ escalated: 0 });

    const at = new Date().toISOString();
    for (const t of stale) {
      await svc.entities.AgentTask.update(t.id, {
        observers: Array.from(new Set([...(t.observers || []), CHIEF_OF_STAFF.name])),
        history: [...(t.history || []), { at, event: MARK, by: 'Review Watchdog' }]
      });
    }

    const list = stale.map((t: any) => `<li><strong>${esc(t.title)}</strong> (${esc(t.action_type)}, ${esc(t.agent_name || 'unassigned')}) — in review since ${new Date(t.updated_date).toLocaleString('en-US', { timeZone: 'America/Chicago' })}</li>`).join('');
    await svc.entities.AgentTask.create({
      title: `Chief of Staff: resolve ${stale.length} task(s) stuck in review 48h+`,
      instructions: `These tasks have been awaiting review for more than 48 hours without a resolution:\n${stale.map((t: any) => `- ${t.title} (id ${t.id})`).join('\n')}`,
      area: 'general', action_type: 'analyze', risk: 'low',
      agent_key: CHIEF_OF_STAFF.key, agent_name: CHIEF_OF_STAFF.name,
      status: 'queued', owner_email: FOUNDER_EMAIL
    });
    await svc.integrations.Core.SendEmail({
      to: FOUNDER_EMAIL,
      from_name: 'Write Vibe Chief of Staff',
      category: 'transactional',
      subject: `${stale.length} task(s) stuck in review for over 48 hours`,
      body: `<p>Alexandar Sterling (Chief of Staff) has been notified about these unresolved reviews:</p><ul>${list}</ul><p><a href="https://thewritevibe.net/AgentTasks">Open Agent Tasks</a></p>`
    });
    return Response.json({ escalated: stale.length });
  } catch (error) {
    console.error(error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}