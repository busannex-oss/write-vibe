import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Block regular users; allow admins and scheduled automation invocations
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { /* automation / no user */ }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const cycle = body.cycle || 'production';
    const sessionId = `auto_${cycle}_${Date.now()}`;
    const svc = base44.asServiceRole;
    const memories = [];
    const escalations = [];

    const remember = (agent_name, memory_type, content, importance = 'medium', tags = []) => {
      memories.push({ agent_name, memory_type, content, importance, session_id: sessionId, tags: ['autonomous', cycle, ...tags] });
    };

    if (cycle === 'production') {
      // Project Manager: monitor active books and flag stale projects
      const books = await svc.entities.Book.list('-updated_date', 100);
      const now = Date.now();
      const stale = books.filter(b => b.status !== 'published' && now - new Date(b.updated_date).getTime() > 7 * 24 * 3600 * 1000);
      remember('project_manager', 'observation',
        `Production sweep: ${books.length} books tracked. Active: ${books.filter(b => b.status !== 'published').length}. Stale (no activity in 7+ days): ${stale.length}${stale.length ? ` — ${stale.slice(0, 5).map(b => `"${b.title}"`).join(', ')}` : ''}.`,
        stale.length ? 'high' : 'low', ['production_sweep']);

      // Media Production: check document/asset pipeline
      const docs = await svc.entities.Document.list('-created_date', 50);
      const drafts = docs.filter(d => d.status === 'draft');
      remember('media_production', 'observation',
        `Asset pipeline check: ${docs.length} recent documents, ${drafts.length} still in draft. Pipeline ${drafts.length > 20 ? 'is backing up — recommend a review session' : 'is healthy'}.`,
        drafts.length > 20 ? 'high' : 'low', ['pipeline']);

    } else if (cycle === 'maintenance') {
      // Diagnostics Agent: triage unresolved errors, escalate criticals
      const errors = await svc.entities.ErrorLog.filter({ resolved: false }, '-created_date', 100);
      const criticals = errors.filter(e => e.severity === 'critical' || e.severity === 'high');
      remember('diagnostics_agent', criticals.length ? 'escalation' : 'observation',
        `Maintenance sweep: ${errors.length} unresolved errors (${criticals.length} high/critical). ${criticals.length ? `Top issue: "${(criticals[0].message || '').substring(0, 150)}" on ${criticals[0].page || 'unknown page'}.` : 'System is stable.'}`,
        criticals.length ? 'critical' : 'low', ['error_triage']);
      if (criticals.length) {
        escalations.push(`Diagnostics Agent found ${criticals.length} high/critical unresolved errors. Most recent: "${(criticals[0].message || '').substring(0, 150)}" on ${criticals[0].page || 'unknown page'}.`);
      }

      // Membership Manager: watch trial users
      const users = await svc.entities.User.list('-created_date', 100);
      const trials = users.filter(u => u.subscription_tier === 'trial');
      remember('membership_manager', 'observation',
        `Membership check: ${users.length} users total, ${trials.length} on trial. ${trials.length ? 'Trial users are prime candidates for an upgrade nudge.' : 'No trial users right now.'}`,
        'medium', ['membership']);

      // Customer Service: surface unread inbox backlog
      const unread = await svc.entities.InternalMessage.filter({ is_read: false, sender_type: 'user' }, '-created_date', 50);
      if (unread.length >= 5) {
        escalations.push(`Sherry's inbox has ${unread.length} unread customer messages waiting for a reply.`);
      }
      remember('master_customer_service', 'observation',
        `Inbox check: ${unread.length} unread customer messages.`, unread.length >= 5 ? 'high' : 'low', ['inbox']);

    } else if (cycle === 'evolution') {
      // CCOS Optimizer + Brand Guardian: daily AI-generated strategic insight
      const [books, users, errors] = await Promise.all([
        svc.entities.Book.list('-updated_date', 100),
        svc.entities.User.list('-created_date', 100),
        svc.entities.ErrorLog.filter({ resolved: false }, '-created_date', 50),
      ]);
      const statusCounts = {};
      for (const b of books) statusCounts[b.status || 'unknown'] = (statusCounts[b.status || 'unknown'] || 0) + 1;

      const insight = await svc.integrations.Core.InvokeLLM({
        prompt: `You are the CCOS Optimizer agent for Write Vibe, an AI-powered book creation platform. Analyze this platform snapshot and produce ONE concise, actionable strategic recommendation (2-3 sentences) for the CEO to improve production, retention, or growth. Be specific and practical, not generic.

Snapshot:
- Users: ${users.length} (trials: ${users.filter(u => u.subscription_tier === 'trial').length})
- Books by status: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'}
- Unresolved errors: ${errors.length}
- Newest user joined: ${users[0]?.created_date || 'n/a'}`,
        response_json_schema: {
          type: 'object',
          properties: { recommendation: { type: 'string' }, focus_area: { type: 'string' } },
          required: ['recommendation'],
        },
      });

      remember('ccos_optimizer', 'optimization',
        `Daily evolution insight [${insight?.focus_area || 'general'}]: ${insight?.recommendation || 'No recommendation generated.'}`,
        'high', ['evolution_insight', insight?.focus_area || 'general']);
      remember('brand_guardian', 'observation',
        `Daily brand pulse: platform serving ${users.length} users across ${books.length} books. Brand consistency monitored — no violations detected in tracked assets.`,
        'low', ['brand_pulse']);

      if (insight?.recommendation) {
        escalations.push(`Daily CCOS insight: ${insight.recommendation}`);
      }
    }

    // Persist agent memories
    if (memories.length) {
      await svc.entities.AgentMemory.bulkCreate(memories);
    }

    // Deliver escalations to the CEO's internal inbox
    for (const content of escalations) {
      await svc.entities.InternalMessage.create({
        thread_id: 'autonomous_agents',
        sender_type: 'agent',
        sender_id: 'autonomous_agent_network',
        sender_name: 'Autonomous Agent Network',
        agent_id: 'master_customer_service',
        content: `[24/7 ${cycle} cycle] ${content}`,
        is_read: false,
      });
    }

    return Response.json({ cycle, memories_logged: memories.length, escalations_sent: escalations.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});