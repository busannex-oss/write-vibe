import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Unified Analytics Fetcher
 * Pulls data from Google Analytics (via Search Console / GA4) and Adwizar.ai
 * Falls back to LLM-synthesized mock data when API keys are missing.
 * 
 * Actions:
 *  - overview   : high-level KPI summary (sessions, conversions, ad spend, ROAS, etc.)
 *  - traffic    : GA4 channel/source breakdown
 *  - ads        : Adwizar campaign performance
 *  - books      : per-book performance cross-referencing both platforms
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action = 'overview', date_range = '30d' } = body;

    const GA4_API_KEY = Deno.env.get('GA4_PROPERTY_ID');
    const ADWIZAR_API_KEY = Deno.env.get('ADWIZAR_API_KEY');
    const ADWIZAR_WORKSPACE = Deno.env.get('ADWIZAR_WORKSPACE_ID');

    // ── Helper: fetch GA4 data ────────────────────────────────────────────────
    const fetchGA4 = async (metric) => {
      if (!GA4_API_KEY) return null;
      try {
        const res = await fetch(
          `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_API_KEY}:runReport`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GA4_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metric)
          }
        );
        return res.ok ? await res.json() : null;
      } catch (_) { return null; }
    };

    // ── Helper: fetch Adwizar data ────────────────────────────────────────────
    const fetchAdwizar = async (endpoint, params = {}) => {
      if (!ADWIZAR_API_KEY || !ADWIZAR_WORKSPACE) return null;
      try {
        const qs = new URLSearchParams({ workspace: ADWIZAR_WORKSPACE, ...params }).toString();
        const res = await fetch(`https://api.adwizar.ai/v1/${endpoint}?${qs}`, {
          headers: { 'Authorization': `Bearer ${ADWIZAR_API_KEY}` }
        });
        return res.ok ? await res.json() : null;
      } catch (_) { return null; }
    };

    // ── LLM fallback: synthesize realistic analytics data ────────────────────
    const llmFallback = async (context) => {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate realistic analytics dashboard data for an AI book publishing platform called AuthorForge. Context: ${context}. Date range: last ${date_range}. Return plausible but clearly synthetic data that looks like a real SaaS platform with ~500 active users.`,
        response_json_schema: {
          type: "object",
          properties: {
            sessions: { type: "number" },
            new_users: { type: "number" },
            returning_users: { type: "number" },
            avg_session_duration: { type: "string" },
            bounce_rate: { type: "string" },
            conversions: { type: "number" },
            conversion_rate: { type: "string" },
            top_pages: {
              type: "array",
              items: { type: "object", properties: { page: { type: "string" }, views: { type: "number" }, avg_time: { type: "string" } } }
            },
            traffic_sources: {
              type: "array",
              items: { type: "object", properties: { source: { type: "string" }, sessions: { type: "number" }, percentage: { type: "number" } } }
            },
            daily_sessions: {
              type: "array",
              items: { type: "object", properties: { date: { type: "string" }, sessions: { type: "number" }, users: { type: "number" } } }
            },
            ad_spend: { type: "number" },
            ad_impressions: { type: "number" },
            ad_clicks: { type: "number" },
            ad_ctr: { type: "string" },
            ad_cpc: { type: "number" },
            roas: { type: "number" },
            top_campaigns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }, spend: { type: "number" },
                  impressions: { type: "number" }, clicks: { type: "number" },
                  conversions: { type: "number" }, roas: { type: "number" }, status: { type: "string" }
                }
              }
            },
            top_books: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" }, page_views: { type: "number" },
                  ad_spend: { type: "number" }, conversions: { type: "number" }, revenue_est: { type: "number" }
                }
              }
            }
          }
        }
      });
      return result;
    };

    // ── OVERVIEW ─────────────────────────────────────────────────────────────
    if (action === 'overview') {
      const [gaData, adwizarData] = await Promise.allSettled([
        fetchGA4({ dateRanges: [{ startDate: `${date_range.replace('d', '')}daysAgo`, endDate: 'today' }], metrics: [{ name: 'sessions' }, { name: 'newUsers' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }] }),
        fetchAdwizar('campaigns/summary', { range: date_range })
      ]);

      const ga = gaData.status === 'fulfilled' ? gaData.value : null;
      const adwizar = adwizarData.status === 'fulfilled' ? adwizarData.value : null;

      if (ga && adwizar) {
        return Response.json({ success: true, source: 'live', ga, adwizar });
      }

      // Use LLM fallback
      const synthetic = await llmFallback('overview KPIs including GA4 sessions/users and Adwizar ad spend/ROAS');
      return Response.json({ success: true, source: 'synthetic', data: synthetic });
    }

    // ── TRAFFIC ──────────────────────────────────────────────────────────────
    if (action === 'traffic') {
      const gaData = await fetchGA4({
        dateRanges: [{ startDate: `${date_range.replace('d', '')}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'newUsers' }]
      });

      if (gaData) return Response.json({ success: true, source: 'live', data: gaData });

      const synthetic = await llmFallback('traffic channel breakdown: organic search, direct, social, referral, paid');
      return Response.json({ success: true, source: 'synthetic', data: synthetic });
    }

    // ── ADS ──────────────────────────────────────────────────────────────────
    if (action === 'ads') {
      const adwizarData = await fetchAdwizar('campaigns', { range: date_range, limit: 10 });

      if (adwizarData) return Response.json({ success: true, source: 'live', data: adwizarData });

      const synthetic = await llmFallback('Adwizar advertising campaigns for book publishing: spend, impressions, clicks, ROAS per campaign');
      return Response.json({ success: true, source: 'synthetic', data: synthetic });
    }

    // ── BOOKS ─────────────────────────────────────────────────────────────────
    if (action === 'books') {
      const books = await base44.asServiceRole.entities.Book.list('-created_date', 50);
      const synthetic = await llmFallback(`Per-book analytics for these books: ${books.map(b => b.title).slice(0, 10).join(', ')}`);
      return Response.json({ success: true, source: 'synthetic', data: synthetic, books: books.map(b => ({ id: b.id, title: b.title })) });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});