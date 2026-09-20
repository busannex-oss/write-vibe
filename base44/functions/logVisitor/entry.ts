import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const sessionId = String(body.session_id || '').substring(0, 100);
    if (!sessionId) return Response.json({ error: 'session_id required' }, { status: 400 });

    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      // anonymous visitor
    }

    const visitorType = user ? (user.role === 'admin' ? 'admin' : 'member') : 'visitor';

    await base44.asServiceRole.entities.VisitorLog.create({
      session_id: sessionId,
      visitor_type: visitorType,
      user_email: user?.email || '',
      user_name: user?.full_name || '',
      page: String(body.page || '').substring(0, 200),
      referrer: String(body.referrer || '').substring(0, 500),
      user_agent: (req.headers.get('user-agent') || '').substring(0, 300),
      returning: !!body.returning,
      greeted_by: 'sherry_givens',
      visited_at: new Date().toISOString(),
    });

    return Response.json({
      ok: true,
      visitor_type: visitorType,
      first_name: user?.full_name ? user.full_name.split(' ')[0] : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}