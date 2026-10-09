import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    const bookId = payload.book_id;
    if (!bookId) return Response.json({ error: 'book_id is required' }, { status: 400 });

    const book = await svc.entities.Book.get(bookId);
    const isOwner = book.created_by_id === user.id;
    const isAdmin = user.role === 'admin';

    let isMember = false;
    if (!isOwner && !isAdmin) {
      const members = await svc.entities.TeamMember.filter({ book_id: bookId, user_email: user.email });
      isMember = members.some((m) => m.status === 'active');
    }

    if (!isOwner && !isAdmin && !isMember) {
      return Response.json({ error: 'You do not have access to this book.' }, { status: 403 });
    }

    const action = payload.action || 'get';

    if (action === 'get') {
      const allComments = await svc.entities.BookComment.filter({ book_id: bookId });
      const comments = (isOwner || isAdmin) ? allComments : allComments.filter((c) =>
        c.created_by_id === user.id || c.author_email === user.email ||
        (Array.isArray(c.visible_to) && c.visible_to.includes(user.email))
      );
      const members = await svc.entities.TeamMember.filter({ book_id: bookId });
      return Response.json({
        book,
        comments,
        members,
        access: { isOwner, isAdmin, isMember }
      });
    }

    if (action === 'comment') {
      if (!payload.content || !payload.content.trim()) {
        return Response.json({ error: 'Comment content is required.' }, { status: 400 });
      }
      const comment = await svc.entities.BookComment.create({
        book_id: bookId,
        target_type: payload.target_type || 'general',
        chapter_number: payload.chapter_number ?? null,
        character_name: payload.character_name || null,
        author_email: user.email,
        author_name: user.full_name || user.email,
        content: payload.content.trim(),
        status: 'open'
      });
      return Response.json({ comment });
    }

    if (action === 'resolve') {
      const [existing] = await svc.entities.BookComment.filter({ id: payload.comment_id });
      if (!existing || existing.book_id !== bookId) {
        return Response.json({ error: 'Comment not found for this book.' }, { status: 404 });
      }
      if (!isOwner && !isAdmin && existing.created_by_id !== user.id && existing.author_email !== user.email) {
        return Response.json({ error: 'Only the book owner or comment author can change this comment.' }, { status: 403 });
      }
      const status = ['open', 'addressed', 'dismissed'].includes(payload.status) ? payload.status : 'addressed';
      const updated = await svc.entities.BookComment.update(existing.id, { status });
      return Response.json({ comment: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});