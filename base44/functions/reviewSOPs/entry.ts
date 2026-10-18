import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { reviewSop } from '../../shared/sopBoardReview.ts';

// Runs the Advisory Board review for SOPs waiting on the board (a few per run).
// Admins may pass { id } to review one SOP immediately.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole;
    if (body.id) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    const pending = body.id
      ? [await svc.entities.SOP.get(body.id)]
      : (await svc.entities.SOP.filter({ review_stage: 'pending_board' }, { sort: 'updated_date', limit: 3 })).items;

    const results = [];
    for (const sop of pending) {
      await svc.entities.SOP.update(sop.id, { review_stage: 'in_review' });
      const updated = await reviewSop(svc, sop);
      results.push({ id: sop.id, title: sop.title, stage: updated.review_stage });
    }
    return Response.json({ success: true, reviewed: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});