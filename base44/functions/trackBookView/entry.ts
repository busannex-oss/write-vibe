import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Records a real visit to a public book website page.
 * Called by anonymous visitors, so it runs with the service role — but it only
 * ever writes a view row for a book the author has actually made public.
 */
function classifySource(referrer) {
  if (!referrer) return 'direct';
  let host = '';
  try { host = new URL(referrer).hostname.toLowerCase(); } catch (_) { return 'referral'; }
  if (/google\.|bing\.|duckduckgo\.|yahoo\./.test(host)) return 'search';
  if (/facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|t\.co|tiktok\.|pinterest\.|reddit\./.test(host)) return 'social';
  return 'referral';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { bookId, referrer = '', sessionId = '' } = body;

    if (!bookId) return Response.json({ error: 'bookId required' }, { status: 400 });

    let book = null;
    try {
      const books = await base44.asServiceRole.entities.Book.filter({ id: bookId });
      book = books?.[0] || null;
    } catch (_) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    // Only count visits to pages the author intentionally published
    const siteStatus = book.website_config?.status;
    const isPublic = book.status === 'published' || siteStatus === 'live' || siteStatus === 'coming_soon';
    if (!isPublic) return Response.json({ tracked: false });

    await base44.asServiceRole.entities.BookPageView.create({
      book_id: book.id,
      book_title: book.title,
      owner_email: book.created_by,
      source: classifySource(referrer),
      referrer: String(referrer).slice(0, 500),
      session_id: String(sessionId).slice(0, 100),
      viewed_at: new Date().toISOString()
    });

    return Response.json({ tracked: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}