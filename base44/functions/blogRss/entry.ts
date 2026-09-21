import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SITE_URL = 'https://story-weaver-ai-d1fcdcf2.base44.app';
const FEED_TITLE = 'The Write Vibe Journal';
const FEED_DESC = 'Practical writing, publishing and book marketing lessons from The Write Vibe.';

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  return `<![CDATA[${String(value || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function rfc822(value) {
  const d = value ? new Date(value) : new Date();
  return (isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

function buildItem(post, siteUrl) {
  const link = `${siteUrl}/BlogPost?slug=${encodeURIComponent(post.slug || '')}`;
  const image = post.cover_image_url
    ? `\n      <enclosure url="${esc(post.cover_image_url)}" type="image/jpeg" />`
    : '';
  const categories = (post.tags || [])
    .map((t) => `\n      <category>${cdata(t)}</category>`)
    .join('');
  return `
    <item>
      <title>${cdata(post.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${rfc822(post.published_at || post.created_date)}</pubDate>
      <dc:creator>${cdata(post.author_name || 'The Write Vibe')}</dc:creator>
      <description>${cdata(post.excerpt || post.seo_description || '')}</description>
      <content:encoded>${cdata(post.content || post.excerpt || '')}</content:encoded>${categories}${image}
    </item>`;
}

/**
 * Public RSS 2.0 feed for the blog. Served as XML with proper feed headers so
 * readers, podcast/news aggregators and search engines can subscribe.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const posts = await base44.asServiceRole.entities.BlogPost.filter(
      { status: 'published' },
      '-published_at',
      50
    );

    const siteUrl = SITE_URL.replace(/\/$/, '');
    const feedUrl = `${siteUrl}/functions/blogRss`;
    const lastBuild = rfc822(posts?.[0]?.published_at || posts?.[0]?.created_date);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${cdata(FEED_TITLE)}</title>
    <link>${esc(siteUrl)}/Blog</link>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${cdata(FEED_DESC)}</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} The Write Vibe</copyright>
    <generator>Write Vibe</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <pubDate>${lastBuild}</pubDate>${(posts || []).map((p) => buildItem(p, siteUrl)).join('')}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<error>${esc(error.message)}</error>`,
      { status: 500, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}