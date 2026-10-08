import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { publishToSocial } from '../../shared/socialPublish.ts';

// Shares a newly published blog post link to every connected social account.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { user = null; }
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { post_id } = await req.json();
    if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.BlogPost.get(post_id);
    if (!post || post.status !== 'published') return Response.json({ skipped: true, reason: 'Post not published' });

    const creds = await base44.asServiceRole.entities.SocialCredential.filter({ is_active: true });
    const platforms = [...new Set(creds.map((c) => c.platform))];
    if (!platforms.length && !Deno.env.get('DISCORD_WEBHOOK_URL')) return Response.json({ skipped: true, reason: 'No social accounts connected' });

    const postUrl = `https://thewritevibe.net/BlogPost?slug=${encodeURIComponent(post.slug || '')}`;
    const tags = (post.tags || []).slice(0, 3).map((t) => '#' + t.replace(/[^a-zA-Z0-9]/g, '')).join(' ');
    const caption = `New on The Write Vibe Journal: ${post.title}\n\n${post.excerpt || ''}\n\nRead it here: ${postUrl}${tags ? `\n\n${tags}` : ''}`;

    // Facebook & LinkedIn get a link preview card; Instagram needs the cover image.
    const linkShare = await publishToSocial({ creds, caption, imageUrl: postUrl, platforms: platforms.filter((p) => p !== 'instagram') });
    const igShare = platforms.includes('instagram')
      ? await publishToSocial({ creds, caption, imageUrl: post.cover_image_url, platforms: ['instagram'] })
      : { results: {}, errors: [] };

    const results = { ...linkShare.results, ...igShare.results };
    const errors = [...linkShare.errors, ...igShare.errors];

    // Discord: post to a channel webhook when configured.
    const discordUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (discordUrl) {
      const res = await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📚 **New on The Write Vibe Journal**`,
          embeds: [{ title: post.title, url: postUrl, description: post.excerpt || '', ...(post.cover_image_url ? { image: { url: post.cover_image_url } } : {}) }]
        })
      });
      if (res.ok) { results.discord = 'posted'; platforms.push('discord'); }
      else errors.push(`discord: ${res.status} ${await res.text()}`);
    }

    await base44.asServiceRole.entities.SocialPost.create({
      caption,
      image_url: post.cover_image_url,
      platforms: platforms.filter((p) => p !== 'discord'),
      status: Object.keys(results).length ? 'posted' : 'failed',
      posted_at: new Date().toISOString(),
      post_results: JSON.stringify({ results, errors })
    });

    return Response.json({ post: post.title, shared_to: Object.keys(results), errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}