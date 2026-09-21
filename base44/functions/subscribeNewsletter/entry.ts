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
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'A valid email is required' }, { status: 400 });
    }
    const bookId = body.book_id || 'blog';

    const existing = await svc.entities.NewsletterSubscriber.filter({ email, book_id: bookId });
    if (existing?.length) {
      if (existing[0].status === 'unsubscribed') {
        await svc.entities.NewsletterSubscriber.update(existing[0].id, { status: 'active' });
      }
      return Response.json({ ok: true, already_subscribed: true });
    }

    await svc.entities.NewsletterSubscriber.create({
      email,
      book_id: bookId,
      name: body.name || '',
      status: 'active',
      subscribed_at: new Date().toISOString()
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}