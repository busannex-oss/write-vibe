import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const CONNECTOR_ID = "6ab0d2b6d40b8f5bf63e96da";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!meRes.ok) {
      return Response.json({ error: `LinkedIn profile lookup failed: ${await meRes.text()}` }, { status: 400 });
    }
    const profile = await meRes.json();

    // No postId = connection check only
    if (!body.postId) {
      return Response.json({ connected: true, profileName: profile.name || profile.given_name || "LinkedIn" });
    }

    const post = await base44.entities.BlogPost.get(body.postId);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const articleUrl = body.articleUrl;
    if (!articleUrl) return Response.json({ error: 'Missing article URL' }, { status: 400 });

    const media = {
      status: "READY",
      originalUrl: articleUrl,
      title: { text: (post.title || "").slice(0, 200) }
    };
    if (post.excerpt) media.description = { text: post.excerpt.slice(0, 256) };
    if (post.cover_image_url) media.thumbnails = [{ url: post.cover_image_url }];

    const commentary = body.commentary || `${post.title}\n\n${post.excerpt || ""}\n\nRead the full article: ${articleUrl}`;

    const shareRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify({
        author: `urn:li:person:${profile.sub}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: commentary.slice(0, 2900) },
            shareMediaCategory: "ARTICLE",
            media: [media]
          }
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
      })
    });

    const text = await shareRes.text();
    if (!shareRes.ok) {
      return Response.json({ error: `LinkedIn share failed: ${text}` }, { status: 400 });
    }

    return Response.json({ shared: true, linkedinId: shareRes.headers.get("x-restli-id") || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}