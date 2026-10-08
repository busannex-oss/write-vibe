import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Public newsletter signup used by the blog and public pages.
 * Creates a NewsletterSubscriber record (which in turn triggers CRM enrichment).
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@<>"']{1,64}@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(email) || email.length > 254) {
      return Response.json({ error: 'A valid email is required' }, { status: 400 });
    }
    let bookId = 'blog';
    if (body.book_id && body.book_id !== 'blog') {
      const [b] = await svc.entities.Book.filter({ id: String(body.book_id) });
      if (!b) return Response.json({ error: 'Unknown book' }, { status: 400 });
      bookId = b.id;
    }

    // Dedupe by address across all books; anonymous calls never re-activate an unsubscribe
    const existing = await svc.entities.NewsletterSubscriber.filter({ email });
    if (existing?.length) {
      return Response.json({ ok: true, already_subscribed: true });
    }

    await svc.entities.NewsletterSubscriber.create({
      email,
      book_id: bookId,
      name: String(body.name || '').replace(/[<>{}\[\]]/g, '').slice(0, 80),
      status: 'active',
      subscribed_at: new Date().toISOString()
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}