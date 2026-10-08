import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const PORTAL_BASE_URL = 'https://thewritevibe.net';
const MAX_INVITES_PER_BOOK = 25;

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isExpired = (a) => a.expires_at && new Date(a.expires_at).getTime() < Date.now();

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Caller must own the book (or be an admin) to manage its agent access
    const canManageBook = async (bookId) => {
      if (!bookId) return false;
      if (user.role === 'admin') return true;
      const found = await svc.entities.Book.filter({ id: bookId });
      const book = found?.[0];
      return !!book && (book.created_by_id === user.id || book.created_by === user.email);
    };
    const forbidden = () => Response.json({ error: 'Forbidden' }, { status: 403 });

    // ── INVITE AGENT ──────────────────────────────────────────────────────────
    if (action === 'invite_agent') {
      const { book_id, agent_email, agent_name, agency_name, permissions, expires_at, notes } = body;
      if (!(await canManageBook(book_id))) return forbidden();
      const email = String(agent_email || '').trim();
      if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) {
        return Response.json({ error: 'Valid agent email required' }, { status: 400 });
      }
      const existing = await svc.entities.AgentAccess.filter({ book_id });
      if (existing.length >= MAX_INVITES_PER_BOOK) {
        return Response.json({ error: 'Invitation limit reached for this book' }, { status: 429 });
      }

      const token = generateToken();
      const record = await svc.entities.AgentAccess.create({
        book_id, agent_email: email, agent_name, agency_name,
        access_token: token,
        status: 'active',
        permissions: permissions || ['metadata', 'manuscript_preview', 'milestones', 'comments'],
        expires_at: expires_at || null,
        notes: notes || ''
      });

      const portalUrl = `${PORTAL_BASE_URL}/AgentPortal?token=${encodeURIComponent(token)}`;
      await svc.integrations.Core.SendEmail({
        to: email,
        subject: `You've been granted access to a manuscript on The Write Vibe`,
        body: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:22px;font-weight:700;color:#fbbf24;margin:0;">The Write Vibe</h1>
    <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Literary Agent Portal</p>
  </div>
  <p style="font-size:15px;line-height:1.7;">Hello ${esc(agent_name || email)},</p>
  <p style="font-size:15px;line-height:1.7;">An author has granted you secure access to review their manuscript project on The Write Vibe platform.</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${esc(portalUrl)}" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#000;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;">Access Agent Portal →</a>
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;">This link is unique to you. Do not share it. ${expires_at ? `Access expires ${esc(new Date(expires_at).toLocaleDateString())}.` : ''}</p>
</div>`
      });

      return Response.json({ success: true, record, portal_url: portalUrl });
    }

    // ── GET AGENTS FOR BOOK ───────────────────────────────────────────────────
    if (action === 'get_agents') {
      if (!(await canManageBook(body.book_id))) return forbidden();
      const agents = await svc.entities.AgentAccess.filter({ book_id: body.book_id });
      return Response.json({ success: true, agents });
    }

    // ── REVOKE ACCESS ─────────────────────────────────────────────────────────
    if (action === 'revoke') {
      const found = await svc.entities.AgentAccess.filter({ id: body.agent_id });
      if (!found?.length || !(await canManageBook(found[0].book_id))) return forbidden();
      await svc.entities.AgentAccess.update(found[0].id, { status: 'revoked' });
      return Response.json({ success: true });
    }

    // ── TOKEN LOGIN (agent visits portal) ─────────────────────────────────────
    if (action === 'token_login') {
      const { token } = body;
      if (!token) return Response.json({ error: 'Invalid or expired token' }, { status: 403 });
      const matches = await svc.entities.AgentAccess.filter({ access_token: token, status: 'active' });
      const access = matches?.[0];
      if (!access || access.access_token !== token || isExpired(access)) {
        return Response.json({ error: 'Invalid or expired token' }, { status: 403 });
      }

      await svc.entities.AgentAccess.update(access.id, { last_accessed: new Date().toISOString() });

      const bookList = await svc.entities.Book.filter({ id: access.book_id });
      const book = bookList?.[0];
      if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

      const perms = access.permissions || [];
      const safeBook = {};
      if (perms.includes('metadata')) {
        safeBook.title = book.title;
        safeBook.subtitle = book.subtitle;
        safeBook.category = book.category;
        safeBook.subcategory = book.subcategory;
        safeBook.plot_summary = book.plot_summary;
        safeBook.book_summary = book.book_summary;
        safeBook.characters = book.characters?.map(c => ({ name: c.name, role: c.role, description: c.description }));
        safeBook.status = book.status;
        safeBook.target_audience = book.target_audience;
        safeBook.front_cover_url = book.front_cover_url;
      }
      if (perms.includes('manuscript_preview')) {
        safeBook.manuscript_chapters = book.manuscript_chapters?.map(c => ({
          chapter_number: c.chapter_number,
          chapter_title: c.chapter_title,
          content: (c.content || '').substring(0, 2000) + (c.content?.length > 2000 ? '\n\n[Preview limited to 2000 characters]' : ''),
          word_count: c.word_count
        }));
      }
      if (perms.includes('milestones')) {
        safeBook.table_of_contents = book.table_of_contents;
        safeBook.detailed_outline = book.detailed_outline?.map(o => ({ chapter_number: o.chapter_number, chapter_title: o.chapter_title, summary: o.summary }));
      }

      const agentComments = await svc.entities.AgentComment.filter({ book_id: access.book_id, agent_access_id: access.id }, '-created_date', 100);
      const { access_token: _t, ...safeAccess } = access;
      return Response.json({ success: true, access: safeAccess, book: safeBook, comments: agentComments });
    }

    // ── POST COMMENT (verified via token) ─────────────────────────────────────
    if (action === 'post_comment') {
      const { token, agent_access_id, chapter_number, comment_type, content, priority } = body;
      if (!token) return Response.json({ error: 'Invalid token' }, { status: 403 });
      const matches = await svc.entities.AgentAccess.filter({ access_token: token, status: 'active' });
      const access = matches?.[0];
      if (!access || access.access_token !== token || access.id !== agent_access_id || isExpired(access)) {
        return Response.json({ error: 'Invalid token' }, { status: 403 });
      }

      const comment = await svc.entities.AgentComment.create({
        book_id: access.book_id, agent_access_id: access.id,
        agent_name: access.agent_name, agent_email: access.agent_email,
        chapter_number: chapter_number || 0,
        comment_type: comment_type || 'general',
        content, priority: priority || 'medium', status: 'open'
      });
      return Response.json({ success: true, comment });
    }

    // ── GET COMMENTS FOR BOOK (author view) ───────────────────────────────────
    if (action === 'get_comments') {
      if (!(await canManageBook(body.book_id))) return forbidden();
      const comments = await svc.entities.AgentComment.filter({ book_id: body.book_id });
      return Response.json({ success: true, comments });
    }

    // ── UPDATE COMMENT STATUS ─────────────────────────────────────────────────
    if (action === 'update_comment') {
      const { comment_id, status, author_reply } = body;
      const found = await svc.entities.AgentComment.filter({ id: comment_id });
      if (!found?.length || !(await canManageBook(found[0].book_id))) return forbidden();
      await svc.entities.AgentComment.update(comment_id, { status, author_reply });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}