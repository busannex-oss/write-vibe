import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * White Paper Generator & Trend Monitor
 * Actions:
 *  - generate   : LLM generates full industry-standard white paper
 *  - monitor    : Checks current market trends and returns update suggestions
 *  - auto_update: Fetches trends and rewrites/refreshes the white paper content
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const { title, industry = 'book publishing', focus = '' } = body;
      if (!title) return Response.json({ error: 'title is required' }, { status: 400 });

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a senior Wall Street analyst and industry strategist at a top-tier investment bank. Write a formal, investment-grade white paper titled "${title}" for the ${industry} industry.
${focus ? `Focus area: ${focus}` : ''}
Date: ${today}

ABOUT THE PLATFORM THIS DOCUMENT IS FOR:
Write Vibe is an AI-powered book creation and publishing platform that enables authors to write, design, market, and publish professional books using artificial intelligence. The platform offers: AI manuscript writing, AI cover design, AI audiobook generation, AI marketing campaigns, Amazon KDP/ACX direct publishing integration, white-label licensing, and team collaboration tools. Founded 2025, Chicago IL. Target market: 11M+ self-publishing authors globally.

This white paper must read like a Goldman Sachs or Morgan Stanley investment research document. Use formal financial language throughout. Include:

EXECUTIVE SUMMARY
Write a precise 3-paragraph executive summary with specific dollar figures, market opportunity, and key investment thesis.

AUTHORFORGE PLATFORM OVERVIEW
Detailed description of platform capabilities, technology stack, AI features, product differentiation, and competitive moat.

MARKET OPPORTUNITY & SIZING
TAM: Global self-publishing + book creation market. SAM: AI-assisted publishing tools. SOM: Near-term capturable market. Include specific dollar figures (billions). Year-over-year growth rates. CAGR projections through 2030.

FINANCIAL MODEL & REVENUE PROJECTIONS
Detailed revenue model: SaaS subscription tiers (Starter $29/mo, Professional $79/mo, Enterprise $199/mo, White Label $999/mo). Projected ARR for Year 1-5. Projected users. LTV/CAC analysis. Gross margin targets (target 78%+). EBITDA timeline.

COMPETITIVE LANDSCAPE
Matrix comparing Write Vibe vs. Scrivener, Vellum, Reedsy, Jasper AI, and traditional publishers on 6+ dimensions. Why AuthorForge wins.

TECHNOLOGY & AI INFRASTRUCTURE
AI models powering the platform, infrastructure costs, scalability, proprietary advantages.

GO-TO-MARKET STRATEGY
Customer acquisition channels, pricing strategy, partnership opportunities (Amazon, IngramSpark), white-label B2B licensing.

RISK FACTORS
Regulatory, competitive, technical, and market risks with specific mitigation strategies.

INVESTMENT THESIS & VALUATION
Comparable company analysis (Canva, Jasper AI, Reedsy valuations). Revenue multiple assumptions. 3-year price target methodology. Why now.

CONCLUSION
Strong closing investment thesis.

APPENDIX: KEY METRICS & ASSUMPTIONS
All financial assumptions in table format.

Use precise dollar amounts, percentages, and dates throughout. No vague language. Format headers in ALL CAPS. ~2500 words.`
      });

      const versionTag = `[Generated: ${today}]`;
      return Response.json({ success: true, content: `${versionTag}\n\n${content}` });
    }

    // ── MONITOR ──────────────────────────────────────────────────────────────
    if (action === 'monitor') {
      const { document_id, title, content_preview } = body;
      if (!title) return Response.json({ error: 'title is required' }, { status: 400 });

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const trends = await base44.asServiceRole.integrations.Core.InvokeLLM({
        add_context_from_internet: true,
        prompt: `Today is ${today}. Search for the latest market trends, news, and developments relevant to this white paper topic: "${title}".
Current document summary: ${(content_preview || '').slice(0, 500)}

Identify:
1. What has changed in the market since this was written?
2. New statistics or data points to include
3. Emerging trends not yet covered
4. Outdated information that needs updating
5. New regulatory or industry changes

Return a structured analysis.`,
        response_json_schema: {
          type: 'object',
          properties: {
            changes_detected: { type: 'boolean' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
            summary: { type: 'string' },
            new_trends: { type: 'array', items: { type: 'string' } },
            outdated_sections: { type: 'array', items: { type: 'string' } },
            new_data_points: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' }
          }
        }
      });

      return Response.json({ success: true, trends, checked_at: today });
    }

    // ── AUTO_UPDATE ───────────────────────────────────────────────────────────
    if (action === 'auto_update') {
      const { document_id, title, existing_content } = body;
      if (!document_id || !title || !existing_content) {
        return Response.json({ error: 'document_id, title, and existing_content are required' }, { status: 400 });
      }

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // First get current trends from the web
      const trendData = await base44.asServiceRole.integrations.Core.InvokeLLM({
        add_context_from_internet: true,
        prompt: `Today is ${today}. Find the most current market data, trends, and developments for: "${title}". List the top 10 most important current facts, statistics, and trends as of today.`
      });

      // Now rewrite the white paper with updated content
      const updatedContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a senior industry analyst. Update this white paper titled "${title}" with the latest market intelligence as of ${today}.

CURRENT TRENDS & NEW DATA:
${trendData}

EXISTING WHITE PAPER:
${existing_content}

Instructions:
- Keep the overall structure and good existing content
- Update all statistics and data points with current figures
- Add new trends that weren't in the original
- Remove or update outdated information
- Add a "Last Updated: ${today}" line at the very top after the generation date
- Add an "UPDATE LOG" section at the end noting what changed and the date
- Keep the same professional white paper format`
      });

      // Save to database
      await base44.asServiceRole.entities.Document.update(document_id, {
        content: updatedContent,
        status: 'final'
      });

      return Response.json({ success: true, updated_content: updatedContent, updated_at: today });
    }

    // ── BIZPLAN ───────────────────────────────────────────────────────────────
    if (action === 'bizplan') {
      const { company_name, tagline, industry, headquarters, founded, mission } = body;
      if (!company_name) return Response.json({ error: 'company_name is required' }, { status: 400 });

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a McKinsey partner and CFO-level strategist. Write a formal, board-ready 30-Year Strategic Business Plan for:
Company: ${company_name} | Industry: ${industry || 'AI SaaS / Publishing Technology'} | HQ: ${headquarters || 'Chicago, IL'} | Founded: ${founded || '2025'}
Tagline: ${tagline || 'AI-Powered Book Creation Platform'} | Mission: ${mission || 'Democratize professional book publishing through artificial intelligence'}
Date: ${today}

This is Write Vibe — an AI book creation platform. Include specific capabilities: AI manuscript writing, AI cover design, AI audiobook generation, AI marketing, Amazon KDP/ACX integration, white-label B2B licensing.

Write each section with a clear ALL CAPS header. Use specific dollar amounts, headcount, percentages, and dates. This must read like a document prepared for a Series A/B board meeting.

TABLE OF CONTENTS (list all sections)

EXECUTIVE SUMMARY
3 paragraphs: company vision, market opportunity ($B TAM), and 30-year financial outcome.

COMPANY OVERVIEW & VALUE PROPOSITION
Platform features, technology moat, brand identity, founding team, location.

MARKET ANALYSIS
TAM: $47B global publishing market. SAM: $8.2B self-publishing tools. SOM: $850M AI-assisted authoring (2025). CAGR 34% through 2030. Specific competitor analysis.

PRODUCT ROADMAP
Q1-Q4 2025 milestones. 2026-2028 feature expansion. 2029+ platform evolution.

PHASE 1 STRATEGY — YEARS 1-5 (2025-2030)
Revenue target: $0 to $25M ARR. Users: 0 to 85,000. Team: 3 to 45 FTEs. Key milestones, funding rounds (Seed $500K, Series A $5M, Series B $20M).

PHASE 2 STRATEGY — YEARS 6-10 (2031-2035)
Revenue: $25M to $120M ARR. International expansion (UK, Canada, Australia, India). Enterprise & white-label growth. Team: 200 FTEs. Potential strategic acquisition.

PHASE 3 STRATEGY — YEARS 11-20 (2036-2045)
Revenue: $120M to $500M ARR. Platform diversification into audiobooks, film rights, education. M&A strategy (2-3 bolt-on acquisitions). IPO readiness by Year 12-15.

PHASE 4 STRATEGY — YEARS 21-30 (2046-2055)
Revenue: $500M to $2B+ ARR. Global market leadership. Legacy building. Strategic exit options.

FINANCIAL PROJECTIONS
Year 1: $180K ARR, -$420K EBITDA
Year 2: $1.2M ARR, -$180K EBITDA
Year 3: $5.8M ARR, $580K EBITDA
Year 5: $24M ARR, $6.2M EBITDA
Year 10: $118M ARR, $38M EBITDA
Year 20: $490M ARR, $172M EBITDA
Year 30: $1.9B ARR, $760M EBITDA
Gross Margin target: 78%. Include SaaS metrics: churn target <2%/mo, LTV $2,400, CAC $180, LTV:CAC 13:1.

RISK ANALYSIS & MITIGATION
5 specific risks with probability, impact, and mitigation strategy.

TECHNOLOGY & AI STRATEGY
AI model stack, infrastructure, proprietary training data strategy, API partnerships.

ORGANIZATIONAL DESIGN
Org chart by phase. Key executive hires timeline. Compensation philosophy.

INVESTOR VALUE PROPOSITION
Why invest now. Return scenarios (3x, 10x, 25x). Comparable exits in SaaS/AI.

CONCLUSION & 90-DAY ACTION PLAN
10 specific actions for next 90 days with owner and deadline.

~2200 words. Use precise numbers throughout. Formal executive tone.`
      });

      return Response.json({ success: true, content: `[Generated: ${today}]\n\n${content}` });
    }

    return Response.json({ error: 'Invalid action. Use: generate, monitor, auto_update, bizplan' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});