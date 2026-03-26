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
        prompt: `You are a senior industry analyst. Write a comprehensive, authoritative white paper titled "${title}" for the ${industry} industry.
${focus ? `Focus area: ${focus}` : ''}
Date: ${today}

Structure it as a professional white paper with:
1. Executive Summary (2-3 paragraphs)
2. Introduction & Background
3. Current Market Landscape (with data points and statistics)
4. Key Challenges & Pain Points
5. Emerging Trends & Technologies
6. Strategic Recommendations (numbered, actionable)
7. Case Studies / Examples (2-3 brief ones)
8. Future Outlook (12-24 month horizon)
9. Conclusion
10. Appendix: Key Metrics & Data Sources

Use authoritative, precise language. Include realistic statistics. Format with clear section headers using ALL CAPS. Total length: 1500-2500 words.`
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
        prompt: `You are a McKinsey-level strategic consultant. Write a COMPREHENSIVE 30-YEAR STRATEGIC BUSINESS PLAN for:

Company: ${company_name}
Tagline: ${tagline || ''}
Industry: ${industry || 'AI SaaS'}
HQ: ${headquarters || 'USA'}
Founded: ${founded || '2025'}
Mission: ${mission || 'To democratize professional publishing through AI'}
Date: ${today}

Write a professional, branded, multi-page document with these sections:

[BUSINESS PLAN: ${company_name}]
[CONFIDENTIAL — INTERNAL USE ONLY]
[Date: ${today}]

EXECUTIVE SUMMARY
COMPANY OVERVIEW & BRAND IDENTITY
MARKET ANALYSIS & OPPORTUNITY (include TAM/SAM/SOM with dollar figures)
PRODUCT & SERVICE ROADMAP
PHASE 1 STRATEGY (YEARS 1-5): FOUNDATION & GROWTH (revenue targets, team size, key milestones)
PHASE 2 STRATEGY (YEARS 6-10): SCALE & DOMINATION (market leadership, international expansion)
PHASE 3 STRATEGY (YEARS 11-20): DIVERSIFICATION & MOATS (new verticals, AI R&D, M&A)
PHASE 4 STRATEGY (YEARS 21-30): LEGACY & ENDURANCE (moats, valuation targets, IPO/exit)
FINANCIAL PROJECTIONS (Year 1, 5, 10, 20, 30 with revenue + EBITDA)
RISK ANALYSIS & MITIGATION (top 8 risks)
TECHNOLOGY & AI STRATEGY
ORGANIZATIONAL DESIGN
INVESTOR VALUE PROPOSITION
CONCLUSION & 90-DAY ACTION ITEMS

Be specific: use real dollar amounts, percentages, team sizes. Professional McKinsey tone. 2500+ words.`
      });

      return Response.json({ success: true, content: `[Generated: ${today}]\n\n${content}` });
    }

    return Response.json({ error: 'Invalid action. Use: generate, monitor, auto_update, bizplan' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});