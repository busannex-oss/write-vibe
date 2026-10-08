import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Called by the workflow (no user) or manually by an admin.
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { user = null; }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { post_id } = await req.json();
    if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(post_id);
    if (!post || post.status !== 'published') {
      return Response.json({ skipped: true, reason: 'Post not published' });
    }

    const subs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ status: 'active' }, '-created_date', 5000);
    const recipients = new Map();
    for (const s of subs) {
      const email = (s.email || '').trim().toLowerCase();
      if (email && !recipients.has(email)) recipients.set(email, s.name || '');
    }

    const excerpt = post.excerpt || (post.content || '').replace(/[#*_>`\[\]()!-]/g, '').slice(0, 260) + '...';
    const vars = {
      post_title: post.title,
      post_excerpt: excerpt,
      author_name: post.author_name || 'Write Vibe',
      cover_image_url: post.cover_image_url || 'https://thewritevibe.net/og-image.png',
      post_url: `https://thewritevibe.net/BlogPost?slug=${encodeURIComponent(post.slug || '')}`
    };

    const list = [...recipients.entries()];
    let sent = 0;
    const failed = [];
    for (let i = 0; i < list.length; i += 6) {
      const batch = list.slice(i, i + 6);
      const results = await Promise.allSettled(batch.map(([email, name]) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          template_name: 'NewPostDigest',
          variables: { ...vars, first_name: (name || 'there').split(' ')[0] }
        })
      ));
      results.forEach((r, idx) => r.status === 'fulfilled' ? sent++ : failed.push(batch[idx][0]));
    }

    return Response.json({ post: post.title, recipients: list.length, sent, failed: failed.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}