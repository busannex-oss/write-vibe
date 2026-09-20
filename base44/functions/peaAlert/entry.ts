import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { FOUNDER_EMAIL } from '../../shared/founder.ts';

/**
 * Alexandar Sterling (Personal Executive Assistant) alert.
 * Called by the "Alexandar Sterling — Major Change Alert" workflow whenever an
 * agent or teammate records a significant change to a book or to strategy (SOPs).
 * Writes a briefing task for the founder and emails them a short summary.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const { activity_id, action, entity_type, entity_title, actor_name, actor_email, summary } = body;

    let activity = { action, entity_type, entity_title, actor_name, actor_email, summary };
    if (activity_id) {
      const found = await svc.entities.ActivityLog.filter({ id: activity_id });
      if (found?.length) activity = found[0];
    }
    if (!activity.action) {
      return Response.json({ skipped: true, reason: 'no activity data' });
    }

    // Only the Founder & CEO receives Alexandar Sterling's briefings.
    const users = await svc.entities.User.list();
    const admins = users.filter(
      (u) => (u.email || '').toLowerCase() === FOUNDER_EMAIL.toLowerCase()
    );
    if (!admins.length) return Response.json({ skipped: true, reason: 'founder not found' });

    const isStrategy = activity.entity_type === 'sop';
    const subjectLabel = isStrategy ? 'strategy change' : 'book change';
    const who = activity.actor_name || activity.actor_email || 'One of your agents';
    const what = activity.summary ||
      `${String(activity.action).replace(/_/g, ' ')} — ${activity.entity_title || 'untitled'}`;

    const briefResp = await svc.integrations.Core.InvokeLLM({
      prompt: `You are Alexandar Sterling, the discreet Personal Executive Assistant to the Founder & CEO of Write Vibe.
Write a 2-3 sentence alert to the founder about this ${subjectLabel} recorded on the platform.
Who made the change: ${who}
What happened: ${what}
Item type: ${activity.entity_type}
State plainly what changed, why it matters to the founder, and one recommended next step or "no action needed".
Be direct, calm, and professional. No greeting, no sign-off.`
    });
    const brief = typeof briefResp === 'string' ? briefResp : String(briefResp?.text || what);

    const title = `${isStrategy ? 'Strategy' : 'Book'} update: ${activity.entity_title || 'untitled'}`;
    const linkPage = isStrategy ? 'SOPs' : 'Books';

    const created = [];
    for (const admin of admins) {
      const task = await svc.entities.DashboardTask.create({
        user_email: admin.email,
        title,
        description: brief,
        link_page: linkPage,
        source: 'alexandar_sterling',
        completed: false
      });
      created.push(task.id);

      await svc.integrations.Core.SendEmail({
        to: admin.email,
        from_name: 'Alexandar Sterling',
        subject: `Alert: ${title}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px">
          <p style="color:#64748b;font-size:12px;letter-spacing:1px;text-transform:uppercase">Personal Executive Assistant briefing</p>
          <h2 style="margin:4px 0 12px;color:#0f172a">${title}</h2>
          <p style="color:#334155;line-height:1.6">${brief}</p>
          <p style="color:#64748b;font-size:13px">Recorded by ${who}.</p>
          <p style="color:#94a3b8;font-size:12px">— Alexandar Sterling, Personal Executive Assistant</p>
        </div>`,
        text: `${title}\n\n${brief}\n\nRecorded by ${who}.\n— Alexandar Sterling`
      });
    }

    return Response.json({ ok: true, notified: admins.length, tasks: created, brief });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}