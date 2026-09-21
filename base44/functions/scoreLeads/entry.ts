import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { scoreContact } from '../../shared/leadScoring.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date().toISOString();
    const updates = [];
    let page = 0;

    while (true) {
      const batch = await base44.asServiceRole.entities.CRMContact.list('-created_date', 200, page * 200);
      if (!batch?.length) break;

      for (const c of batch) {
        const result = scoreContact(c);
        updates.push({ id: c.id, ...result, score_updated_at: now });
      }
      if (batch.length < 200) break;
      page += 1;
    }

    for (let i = 0; i < updates.length; i += 100) {
      await base44.asServiceRole.entities.CRMContact.bulkUpdate(updates.slice(i, i + 100));
    }

    const counts = updates.reduce((acc, u) => {
      acc[u.attention_level] = (acc[u.attention_level] || 0) + 1;
      return acc;
    }, {});

    return Response.json({ scored: updates.length, counts, scored_at: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}