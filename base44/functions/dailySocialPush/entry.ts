import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { publishToSocial } from '../../shared/socialPublish.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automation (no user) or an admin triggering it manually
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Oldest queued post first — one push per run
    const queued = await base44.asServiceRole.entities.SocialPost.filter(
      { status: 'queued' }, 'created_date', 1
    );

    if (!queued.length) {
      return Response.json({ success: true, message: 'No queued posts to publish.' });
    }

    const post = queued[0];
    const creds = await base44.asServiceRole.entities.SocialCredential.filter({ is_active: true });

    if (!creds.length) {
      return Response.json({ success: false, message: 'No social credentials saved — add API keys in the dashboard.' });
    }

    const { results, errors } = await publishToSocial({
      creds,
      caption: post.caption,
      imageUrl: post.image_url,
      platforms: post.platforms || [],
    });

    const anySuccess = Object.keys(results).length > 0;
    await base44.asServiceRole.entities.SocialPost.update(post.id, {
      status: anySuccess ? 'posted' : 'failed',
      posted_at: anySuccess ? new Date().toISOString() : undefined,
      post_results: JSON.stringify({ results, errors }),
    });

    return Response.json({
      success: anySuccess,
      postId: post.id,
      results,
      errors: errors.length ? errors : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}