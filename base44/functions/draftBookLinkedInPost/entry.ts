import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const STATUS_COPY = {
  draft: 'just started a brand-new book project',
  outline: 'finished outlining my new book',
  writing: 'started writing my new book',
  editing: 'moved my new book into editing',
  cover_design: 'started designing the cover for my new book',
  marketing: 'am getting ready to launch my new book',
  published: 'just published my new book'
};

// Creates a queued (draft) LinkedIn post when a book's status changes.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { book_id } = await req.json();
    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });

    const [book] = await base44.asServiceRole.entities.Book.filter({ id: book_id });
    const caller = await base44.auth.me().catch(() => null);
    const isOwner = caller && book && (book.created_by_id === caller.id || book.created_by === caller.email);
    if (!caller || (caller.role !== 'admin' && !isOwner)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestone = STATUS_COPY[book.status] || 'have an update on my new book';
    const caption = `Exciting news: I ${milestone}, "${book.title}"${book.subtitle ? `: ${book.subtitle}` : ''}.\n\n${book.book_summary || book.plot_summary || ''}\n\nFollow along for updates! #amwriting #books${book.category ? ' #' + book.category.replace(/[^a-zA-Z0-9]/g, '') : ''}`.replace(/\n\n\n+/g, '\n\n');

    const draft = await base44.asServiceRole.entities.SocialPost.create({
      caption,
      image_url: book.front_cover_url || '',
      platforms: ['linkedin'],
      book_id,
      status: 'queued'
    });

    return Response.json({ draft_id: draft.id, status: book.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}