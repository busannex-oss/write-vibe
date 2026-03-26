import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: 'bookId required' }, { status: 400 });
    }

    // Use service role to fetch the book publicly (for book website landing pages)
    const books = await base44.asServiceRole.entities.Book.filter({ id: bookId });
    const book = books?.[0] || null;

    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    // Also fetch the author profile
    let author = null;
    if (book.created_by) {
      const users = await base44.asServiceRole.entities.User.filter({ email: book.created_by });
      author = users?.[0] || null;
    }

    return Response.json({ book, author });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});