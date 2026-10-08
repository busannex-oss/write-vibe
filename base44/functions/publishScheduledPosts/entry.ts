import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Called by the scheduled workflow (no user) or manually by an admin.
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { user = null; }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const scheduled = await base44.asServiceRole.entities.BlogPost.filter({ status: 'scheduled' }, 'scheduled_for', 200);
    const due = scheduled.filter((p) => p.scheduled_for && new Date(p.scheduled_for) <= now);

    for (const post of due) {
      await base44.asServiceRole.entities.BlogPost.update(post.id, {
        status: 'published',
        published_at: post.scheduled_for
      });
    }

    // Scheduled book status changes
    const books = await base44.asServiceRole.entities.Book.filter({ scheduled_status_at: { $lte: now.toISOString() } }, 'scheduled_status_at', 200);
    const dueBooks = books.filter((b) => b.scheduled_status && b.scheduled_status_at);
    for (const book of dueBooks) {
      await base44.asServiceRole.entities.Book.update(book.id, {
        status: book.scheduled_status,
        scheduled_status: null,
        scheduled_status_at: null
      });
    }

    return Response.json({
      books_updated: dueBooks.map((b) => `${b.title} → ${b.scheduled_status}`),
      checked: scheduled.length,
      published: due.length,
      titles: due.map((p) => p.title)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}