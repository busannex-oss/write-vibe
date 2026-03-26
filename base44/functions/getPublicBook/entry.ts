import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: 'bookId required' }, { status: 400 });
    }

    // Use .get() directly — filter() with id can fail due to RLS
    let book = null;
    try {
      book = await base44.asServiceRole.entities.Book.get(bookId);
    } catch (_) {
      book = null;
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

    // Fetch approved reviews via service role (so public visitors can always see them)
    let reviews = [];
    try {
      reviews = await base44.asServiceRole.entities.Review.filter({ book_id: bookId, status: 'approved' });
    } catch (_) {}

    return Response.json({ book, author, reviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});