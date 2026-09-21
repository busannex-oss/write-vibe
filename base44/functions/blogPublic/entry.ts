import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Public blog reader. Returns published posts for the blog index, or a single
 * post by slug (and increments its view count).
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));

    if (body.slug) {
      const found = await svc.entities.BlogPost.filter({ slug: body.slug, status: 'published' });
      const post = found?.[0];
      if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
      await svc.entities.BlogPost.update(post.id, { view_count: (post.view_count || 0) + 1 });

      const all = await svc.entities.BlogPost.filter({ status: 'published' }, '-published_at', 20);
      const related = all.filter((p) => p.id !== post.id).slice(0, 3);
      return Response.json({ post, related });
    }

    const posts = await svc.entities.BlogPost.filter({ status: 'published' }, '-published_at', 50);
    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}