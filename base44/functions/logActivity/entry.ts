import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (caller?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const svc = base44.asServiceRole;

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    const event = payload.event || {};
    const data = payload.data || {};

    const entityName = (event.entity_name || '').toLowerCase(); // "book" | "sop"
    const eventType = event.type || 'update'; // "create" | "update"
    const entityId = event.entity_id;

    if (entityName !== 'book' && entityName !== 'sop') {
      return Response.json({ ok: true, skipped: true, reason: 'untracked entity' });
    }

    // Resolve the actor (the book/SOP owner) from created_by_id
    let actorEmail = null;
    let actorName = null;
    if (data.created_by_id) {
      try {
        const u = await svc.entities.User.get(data.created_by_id);
        actorEmail = u.email;
        actorName = u.full_name;
      } catch (_) {}
    }

    const title = data.title || data.name || 'Untitled';
    const verb = eventType === 'create' ? 'created' : 'updated';
    const action = `${entityName}_${eventType === 'create' ? 'created' : 'updated'}`;
    const entityLabel = entityName === 'book' ? 'book' : 'SOP';

    await svc.entities.ActivityLog.create({
      actor_email: actorEmail,
      actor_name: actorName,
      action,
      entity_type: entityName,
      entity_id: entityId,
      entity_title: title,
      summary: `${actorName || actorEmail || 'Someone'} ${verb} ${entityLabel} "${title}"`
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});