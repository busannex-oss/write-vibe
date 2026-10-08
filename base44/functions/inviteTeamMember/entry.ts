import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ROLES = ['co_author', 'editor', 'publisher', 'marketing', 'assistant'];
const HOURLY_LIMIT = 10;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const email = String(body.user_email || '').trim().toLowerCase();
    const role = ROLES.includes(body.role) ? body.role : 'editor';
    if (!/^[^\s@<>"']{1,64}@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(email) || email.length > 254) {
      return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const book = await svc.entities.Book.get(String(body.book_id || '')).catch(() => null);
    if (!book || (book.created_by !== user.email && user.role !== 'admin')) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    const since = Date.now() - 60 * 60 * 1000;
    const recent = await svc.entities.TeamMember.filter({ created_by: user.email }, '-created_date', 50);
    if (recent.filter((m) => new Date(m.created_date).getTime() > since).length >= HOURLY_LIMIT) {
      return Response.json({ error: 'Too many invitations. Please try again later.' }, { status: 429 });
    }

    const member = await base44.entities.TeamMember.create({
      book_id: book.id, user_email: email, role, status: 'invited'
    });

    const title = String(book.title || 'a book project').replace(/[<>\r\n]/g, '').slice(0, 100);
    await svc.integrations.Core.SendEmail({
      to: email,
      subject: `You've been invited to collaborate on "${title}"`,
      body: `${user.full_name || 'A Write Vibe author'} invited you as a ${role.replace('_', '-')} on a book project. Log in at https://thewritevibe.net to access the collaboration.`
    }).catch(() => null);

    return Response.json({ ok: true, member });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}