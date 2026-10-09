import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SITE = 'https://thewritevibe.net';
const CONFIRM_URL = 'https://writevibe.base44.app/functions/subscribeNewsletter';

/**
 * Public newsletter signup with double opt-in.
 * POST {email, name, book_id} -> creates a pending subscriber and emails a confirmation link.
 * GET ?confirm=<token>        -> activates the subscriber and redirects to the blog.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    if (req.method === 'GET') {
      const token = new URL(req.url).searchParams.get('confirm') || '';
      if (!/^[a-f0-9]{48}$/.test(token)) return Response.redirect(`${SITE}/Blog`, 302);
      const [sub] = await svc.entities.NewsletterSubscriber.filter({ confirm_token: token });
      if (sub && sub.status === 'pending') {
        await svc.entities.NewsletterSubscriber.update(sub.id, {
          status: 'active', confirm_token: '', confirmed_at: new Date().toISOString()
        });
      }
      return Response.redirect(`${SITE}/Blog?subscribed=1`, 302);
    }

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

    // Dedupe by address globally; one confirmation email per address, ever
    const existing = await svc.entities.NewsletterSubscriber.filter({ email });
    if (existing?.length) {
      return Response.json({ ok: true, pending_confirmation: true });
    }

    // Durable throttling: per-IP (hashed) and global caps on new confirmation sends
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const ipDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`wv-nl:${ip}`));
    const ipHash = Array.from(new Uint8Array(ipDigest), (b) => b.toString(16).padStart(2, '0')).join('');
    const hourAgo = new Date(Date.now() - 3600_000).toISOString();
    const dayAgo = new Date(Date.now() - 86400_000).toISOString();
    const [ipRecent, hourRecent, dayRecent] = await Promise.all([
      svc.entities.NewsletterSubscriber.filter({ signup_ip_hash: ipHash, subscribed_at: { $gte: hourAgo } }, '-subscribed_at', 4),
      svc.entities.NewsletterSubscriber.filter({ status: 'pending', subscribed_at: { $gte: hourAgo } }, '-subscribed_at', 31),
      svc.entities.NewsletterSubscriber.filter({ status: 'pending', subscribed_at: { $gte: dayAgo } }, '-subscribed_at', 201)
    ]);
    if (ipRecent.length >= 3 || hourRecent.length >= 30 || dayRecent.length >= 200) {
      return Response.json({ error: 'Too many signups right now. Please try again later.' }, { status: 429 });
    }

    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

    await svc.entities.NewsletterSubscriber.create({
      email,
      book_id: bookId,
      name: String(body.name || '').replace(/[<>{}\[\]]/g, '').slice(0, 80),
      status: 'pending',
      confirm_token: token,
      signup_ip_hash: ipHash,
      subscribed_at: new Date().toISOString()
    });

    await svc.integrations.Core.SendEmail({
      to: email,
      subject: 'Confirm your Write Vibe subscription',
      body: `<p>Please confirm you want to receive the Write Vibe newsletter.</p>
<p><a href="${CONFIRM_URL}?confirm=${token}">Confirm my subscription</a></p>
<p>If you didn't sign up, ignore this email and you won't hear from us.</p>`
    }).catch(() => null);

    return Response.json({ ok: true, pending_confirmation: true });
  } catch (_error) {
    return Response.json({ error: 'Could not subscribe right now' }, { status: 500 });
  }
}