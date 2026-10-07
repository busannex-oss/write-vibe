import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SITE_URL = 'https://story-weaver-ai-d1fcdcf2.base44.app';
const STATIC_PAGES = [
  ['/', 'weekly', '1.0'], ['/Pricing', 'monthly', '0.9'], ['/HowItWorks', 'monthly', '0.9'],
  ['/About', 'monthly', '0.7'], ['/Investor', 'monthly', '0.7'], ['/Contact', 'yearly', '0.6'],
  ['/FAQ', 'monthly', '0.7'], ['/Blog', 'daily', '0.9'], ['/Privacy', 'yearly', '0.3'],
  ['/Terms', 'yearly', '0.3'], ['/CookiePolicy', 'yearly', '0.3']
];

const esc = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (v) => { const d = new Date(v || Date.now()); return (isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10); };

// Public, always-current XML sitemap — rebuilt from live published posts on every request.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const posts = await base44.asServiceRole.entities.BlogPost.filter({ status: 'published' }, '-published_at', 1000);
    const latest = day(posts[0]?.updated_date || posts[0]?.published_at);

    const urls = STATIC_PAGES.map(([path, freq, pri]) =>
      `  <url><loc>${SITE_URL}${path}</loc><lastmod>${path === '/Blog' ? latest : day()}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`);

    for (const p of posts) {
      if (!p.slug) continue;
      urls.push(`  <url><loc>${esc(`${SITE_URL}/BlogPost?slug=${encodeURIComponent(p.slug)}`)}</loc><lastmod>${day(p.updated_date || p.published_at)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
    }
    const tags = [...new Set(posts.flatMap((p) => p.tags || []))];
    for (const t of tags) {
      urls.push(`  <url><loc>${esc(`${SITE_URL}/BlogTag?tag=${encodeURIComponent(t)}`)}</loc><lastmod>${latest}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}