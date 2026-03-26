import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: 'bookId required' }, { status: 400 });
    }

    // Service role bypasses ALL RLS — required for public book website access
    let book = null;
    try {
      const books = await base44.asServiceRole.entities.Book.filter({ id: bookId });
      book = books?.[0] || null;
    } catch (e) {
      return Response.json({ error: 'Book not found', detail: e.message }, { status: 404 });
    }

    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    // Fetch author profile
    let author = null;
    if (book.created_by) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: book.created_by });
        author = users?.[0] || null;
      } catch (_) {}
    }

    // Fetch approved reviews
    let reviews = [];
    try {
      const allReviews = await base44.asServiceRole.entities.Review.filter({ book_id: bookId });
      reviews = allReviews.filter(r => r.status === 'approved');
    } catch (_) {}

    return Response.json({ book, author, reviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});