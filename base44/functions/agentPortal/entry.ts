import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── INVITE AGENT ──────────────────────────────────────────────────────────
    if (action === 'invite_agent') {
      const { book_id, agent_email, agent_name, agency_name, permissions, expires_at, notes } = body;
      const token = generateToken();
      const record = await base44.entities.AgentAccess.create({
        book_id, agent_email, agent_name, agency_name,
        access_token: token,
        status: 'active',
        permissions: permissions || ['metadata', 'manuscript_preview', 'milestones', 'comments'],
        expires_at: expires_at || null,
        notes: notes || ''
      });

      // Send invite email
      const portalUrl = `${req.headers.get('origin') || 'https://app.thewritevibe.com'}/AgentPortal?token=${token}`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: agent_email,
        subject: `You've been granted access to a manuscript on The Write Vibe`,
        body: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#ea580c);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
      <span style="font-size:24px;">📖</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#fbbf24;margin:0;">The Write Vibe</h1>
    <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Literary Agent Portal</p>
  </div>
  <p style="font-size:15px;line-height:1.7;">Hello ${agent_name || agent_email},</p>
  <p style="font-size:15px;line-height:1.7;">An author has granted you secure access to review their manuscript project on The Write Vibe platform.</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${portalUrl}" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#000;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;">Access Agent Portal →</a>
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;">This link is unique to you. Do not share it. ${expires_at ? `Access expires ${new Date(expires_at).toLocaleDateString()}.` : ''}</p>
</div>`
      });

      return Response.json({ success: true, record, portal_url: portalUrl });
    }

    // ── GET AGENTS FOR BOOK ───────────────────────────────────────────────────
    if (action === 'get_agents') {
      const { book_id } = body;
      const agents = await base44.entities.AgentAccess.filter({ book_id });
      return Response.json({ success: true, agents });
    }

    // ── REVOKE ACCESS ─────────────────────────────────────────────────────────
    if (action === 'revoke') {
      const { agent_id } = body;
      await base44.entities.AgentAccess.update(agent_id, { status: 'revoked' });
      return Response.json({ success: true });
    }

    // ── TOKEN LOGIN (agent visits portal) ─────────────────────────────────────
    if (action === 'token_login') {
      const { token } = body;
      const all = await base44.asServiceRole.entities.AgentAccess.list('-created_date', 200);
      const access = all.find(a => a.access_token === token && a.status === 'active');
      if (!access) return Response.json({ error: 'Invalid or expired token' }, { status: 403 });

      // Update last_accessed
      await base44.asServiceRole.entities.AgentAccess.update(access.id, { last_accessed: new Date().toISOString() });

      // Fetch book (limited fields)
      const bookList = await base44.asServiceRole.entities.Book.list();
      const book = bookList.find(b => b.id === access.book_id);
      if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

      // Build safe book snapshot based on permissions
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
          content: c.content?.substring(0, 2000) + (c.content?.length > 2000 ? '\n\n[Preview limited to 2000 characters]' : ''),
          word_count: c.word_count
        }));
      }
      if (perms.includes('milestones')) {
        safeBook.table_of_contents = book.table_of_contents;
        safeBook.detailed_outline = book.detailed_outline?.map(o => ({ chapter_number: o.chapter_number, chapter_title: o.chapter_title, summary: o.summary }));
      }

      // Fetch comments for this book+agent
      const comments = await base44.asServiceRole.entities.AgentComment.list('-created_date', 100);
      const agentComments = comments.filter(c => c.book_id === access.book_id && c.agent_access_id === access.id);

      return Response.json({ success: true, access, book: safeBook, comments: agentComments });
    }

    // ── POST COMMENT (from agent portal, no auth required — verified via token) ─
    if (action === 'post_comment') {
      const { token, book_id, agent_access_id, agent_name, agent_email, chapter_number, comment_type, content, priority } = body;
      // Verify token
      const all = await base44.asServiceRole.entities.AgentAccess.list('-created_date', 200);
      const access = all.find(a => a.access_token === token && a.status === 'active' && a.id === agent_access_id);
      if (!access) return Response.json({ error: 'Invalid token' }, { status: 403 });

      const comment = await base44.asServiceRole.entities.AgentComment.create({
        book_id, agent_access_id, agent_name, agent_email,
        chapter_number: chapter_number || 0,
        comment_type: comment_type || 'general',
        content, priority: priority || 'medium', status: 'open'
      });
      return Response.json({ success: true, comment });
    }

    // ── GET COMMENTS FOR BOOK (author view) ───────────────────────────────────
    if (action === 'get_comments') {
      const { book_id } = body;
      const comments = await base44.entities.AgentComment.filter({ book_id });
      return Response.json({ success: true, comments });
    }

    // ── UPDATE COMMENT STATUS ─────────────────────────────────────────────────
    if (action === 'update_comment') {
      const { comment_id, status, author_reply } = body;
      await base44.entities.AgentComment.update(comment_id, { status, author_reply });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});