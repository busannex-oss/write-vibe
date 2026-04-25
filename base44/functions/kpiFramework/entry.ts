import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  stage: "Early Growth — Pre-Series A, active author base building",
  description: "AI-powered self-publishing platform helping independent authors write, design, publish, and market books end-to-end.",
  revenue_model: [
    "Subscription SaaS: Starter ($29/mo), Professional ($79/mo), Enterprise ($199/mo), White Label ($499/mo+)",
    "Monthly and annual billing cycles; annual saves 20%",
    "Revenue share on white-label deployments: 12–18% of licensee gross subscription revenue",
    "Setup fee for white-label onboarding",
    "Per-seat overage fees above contracted tier limits"
  ],
  distribution_platforms: ["Amazon KDP (Kindle Direct Publishing)", "Amazon ACX (Audiobook Creation Exchange)", "Author-owned book websites"],
  pillars: [
    { name: "Authentic Voice", color: "#f59e0b", definition: "Preserving author originality and creative vision through every AI-assisted step" },
    { name: "Professional Quality", color: "#3b82f6", definition: "Publishing-industry-grade output standards across manuscript, cover, audio, and marketing" },
    { name: "Accessible Empowerment", color: "#10b981", definition: "Democratizing professional publishing tools for authors at all experience levels" },
    { name: "Ethical AI", color: "#8b5cf6", definition: "Transparent, author-serving AI with clear IP protections and no data exploitation" },
    { name: "Community & Legacy", color: "#ec4899", definition: "Supporting author careers, readerships, and lasting literary legacy" },
    { name: "Innovation Leadership", color: "#06b6d4", definition: "Continuous platform evolution, feature delivery, and industry-first capabilities" },
    { name: "Sustainable Business", color: "#84cc16", definition: "Fair revenue models for authors, licensees, and platform long-term viability" },
    { name: "Brand Integrity", color: "#f97316", definition: "Consistent platform standards and identity across all deployments and markets" }
  ],
  strategic_goals: [
    "Reach 10,000 active authors within 24 months of full launch",
    "Achieve $5M ARR by end of Year 2",
    "Establish 5 white-label licensing partnerships by Year 3",
    "Launch in 3 international markets by Year 4",
    "Position for Series A raise at $20M+ valuation by Year 2",
    "Become the #1 AI self-publishing platform by author satisfaction NPS",
    "Build 30-year legacy brand in the independent publishing category"
  ],
  current_metrics: {
    platform_stage: "Early Growth",
    active_authors: "Growing author base in beta/early access",
    books_published: "Multiple titles across KDP and ACX",
    subscription_tiers_active: ["Starter", "Professional"],
    ai_tools_live: 11,
    distribution_channels: 3,
    team_size: "Founding team + AI agents"
  },
  performance_standards: [
    "Author NPS minimum 40",
    "Platform uptime 99.5% monthly SLA",
    "Author onboarding completion rate 70%+ within 30 days",
    "Brand Pillar Alignment Score 75/100+ annually",
    "White-label licensee NPS 35+"
  ]
};

const PILLARS = PLATFORM_CONTEXT.pillars.map(p => p.name);

function buildDocHTML(content, generatedDate, versionNumber) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;color:#1e293b;line-height:1.75;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);padding:52px 48px 44px;">
    <p style="color:#f59e0b;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">The Write Vibe · Investor &amp; Agent Document · Confidential</p>
    <h1 style="font-size:36px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;line-height:1.1;">KPI &amp; Success Metrics Framework</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 6px;">8-Pillar Performance Measurement for Investors &amp; Agents</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">The Write Vibe — AI-Powered Self-Publishing Platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:16px 24px;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Version</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Generated</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${generatedDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Platform Stage</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">Early Growth</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Pillars Measured</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">8 of 8</p></div>
    </div>
  </div>

  <div style="background:#fefce8;border-bottom:1px solid #fde68a;padding:16px 28px;font-family:system-ui,sans-serif;">
    <p style="color:#92400e;font-size:12px;margin:0;line-height:1.8;"><strong>📊 Framework Note:</strong> This KPI &amp; Success Metrics Framework was generated by AI using The Write Vibe's platform data, pillar definitions, strategic goals, and self-publishing industry benchmarks. Baseline values represent early-stage targets; actual figures should be updated quarterly as the platform scales. This document is intended for investor due diligence, agent briefings, and internal performance governance.</p>
  </div>

  <div style="padding:48px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 48px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. Investor &amp; Agent Confidential.</p>
    <p style="color:#cbd5e1;font-size:11px;margin:6px 0 0;">KPI &amp; Success Metrics Framework v${versionNumber} · Generated ${generatedDate} · investors@thewritevibe.com</p>
  </div>
</div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'get_current';
    const DOC_TYPE = 'kpi_framework';

    // ── GET CURRENT ──────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const doc = all.find(d => d.doc_type === DOC_TYPE && d.is_current)
                || all.find(d => d.doc_type === DOC_TYPE)
                || null;
      return Response.json({ success: true, doc });
    }

    // ── VERSIONS ─────────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const versions = all.filter(d => d.doc_type === DOC_TYPE).map(d => ({
        id: d.id, version_number: d.version_number, generated_at: d.generated_at,
        is_current: d.is_current, generation_notes: d.generation_notes
      }));
      return Response.json({ success: true, versions });
    }

    // ── RESTORE ──────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: d.id === id })));
      const restored = sameType.find(d => d.id === id);
      return Response.json({ success: true, doc: restored });
    }

    // ── SAVE ─────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 20);
      const current = all.find(d => d.doc_type === DOC_TYPE && d.is_current) || all.find(d => d.doc_type === DOC_TYPE);
      if (current) {
        await base44.asServiceRole.entities.LegalDocument.update(current.id, { content_html, generated_at: new Date().toISOString() });
        return Response.json({ success: true, id: current.id });
      }
      return Response.json({ error: 'No document to save' }, { status: 404 });
    }

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const contextBlock = `
PLATFORM: ${PLATFORM_CONTEXT.name}
STAGE: ${PLATFORM_CONTEXT.stage}
DESCRIPTION: ${PLATFORM_CONTEXT.description}

REVENUE MODEL:
${PLATFORM_CONTEXT.revenue_model.map(r => `- ${r}`).join('\n')}

DISTRIBUTION CHANNELS: ${PLATFORM_CONTEXT.distribution_platforms.join(', ')}

8 BRAND PILLARS:
${PLATFORM_CONTEXT.pillars.map((p, i) => `${i+1}. ${p.name}: ${p.definition}`).join('\n')}

STRATEGIC GOALS (30-Year Plan):
${PLATFORM_CONTEXT.strategic_goals.map(g => `- ${g}`).join('\n')}

CURRENT PLATFORM METRICS:
- Stage: ${PLATFORM_CONTEXT.current_metrics.platform_stage}
- AI Tools Live: ${PLATFORM_CONTEXT.current_metrics.ai_tools_live}
- Distribution Channels: ${PLATFORM_CONTEXT.current_metrics.distribution_channels}
- Active Subscription Tiers: ${PLATFORM_CONTEXT.current_metrics.subscription_tiers_active.join(', ')}

PERFORMANCE STANDARDS:
${PLATFORM_CONTEXT.performance_standards.map(s => `- ${s}`).join('\n')}`;

      const prompt = `You are a senior business analyst and investor relations specialist for an AI-powered self-publishing SaaS platform. Generate a comprehensive, professional KPI & Success Metrics Framework document for The Write Vibe.

PLATFORM CONTEXT:
${contextBlock}

Generate the complete KPI framework with these sections in this exact order:

1. EXECUTIVE SUMMARY — Platform overview, measurement philosophy, how this framework serves investors and agents (2-3 paragraphs)

2-9. PILLAR KPI SECTIONS — One section per pillar (all 8 pillars). For EACH pillar, generate 3-5 KPIs. Each KPI must include:
   - KPI Name (bold, clear)
   - Definition in self-publishing context (what this measures and why it matters)
   - Measurement Method (how data is collected/calculated)
   - Reporting Frequency (daily/weekly/monthly/quarterly/annual)
   - Baseline Value (realistic early-stage starting point)
   - Target Value (12-month target, then 3-year target)
   - Warning Threshold (value that triggers review)
   - Strategic Significance to Investors (1-2 sentences on why this KPI drives valuation/growth)

10. OVERALL WEIGHTED PERFORMANCE MODEL — How the 8 pillars are weighted in a composite platform health score (use a table), explain the weighting rationale, and describe the scoring methodology

11. CURRENT PLATFORM PERFORMANCE SUMMARY — Honest assessment of where The Write Vibe currently stands against these KPIs given its early-growth stage, what data is being tracked, and what remains to be instrumented

12. PRIORITY IMPROVEMENT AREAS — Top 5 highest-impact KPI gaps to close in the next 90 days, with specific action recommendations

Format each section as clean HTML using <h2>, <h3>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong> tags. NO inline styles. Use professional business language throughout. Make all numbers specific and realistic for a pre-Series A AI SaaS publishing platform.

Return JSON: { "sections": [ { "title": "section title", "content": "full HTML content" } ] }`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: "object",
          properties: {
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Build inner HTML with pillar color coding
      const pillarColors = PLATFORM_CONTEXT.pillars.reduce((acc, p) => { acc[p.name] = p.color; return acc; }, {});

      const innerHtml = (result.sections || []).map((sec, idx) => {
        // Detect if this is a pillar section
        const matchedPillar = PLATFORM_CONTEXT.pillars.find(p => sec.title.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
        const accentColor = matchedPillar ? matchedPillar.color : '#f59e0b';
        const isPillar = idx >= 1 && idx <= 8;

        return `
<div style="margin-bottom:48px;${isPillar ? `border-left:4px solid ${accentColor};padding-left:24px;` : ''}">
  <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;letter-spacing:-0.5px;">${idx === 0 ? '' : `${idx}.`} ${sec.title}</h2>
  ${isPillar ? `<p style="font-size:11px;color:${accentColor};font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Pillar ${idx} of 8 · KPI Block</p>` : '<div style="height:2px;background:linear-gradient(90deg,#f59e0b,transparent);margin:8px 0 20px;"></div>'}
  <div style="font-size:14px;line-height:1.85;color:#374151;">${sec.content}</div>
</div>`;
      }).join('');

      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      const latestVersion = sameType[0]?.version_number || 0;
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: false })));

      const content_html = buildDocHTML(innerHtml, generatedDate, latestVersion + 1);

      const saved = await base44.asServiceRole.entities.LegalDocument.create({
        doc_type: DOC_TYPE,
        version_number: latestVersion + 1,
        title: 'The Write Vibe — KPI & Success Metrics Framework',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · 8 pillars · ${PILLARS.length} KPI blocks`
      });

      return Response.json({ success: true, doc: saved });
    }

    // ── REGENERATE PILLAR ─────────────────────────────────────────────────────
    if (action === 'regenerate_pillar') {
      const { pillar_name } = body;
      const pillar = PLATFORM_CONTEXT.pillars.find(p => p.name === pillar_name) || { name: pillar_name, definition: '' };

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior business analyst. Generate 3-5 KPIs for the "${pillar.name}" pillar of The Write Vibe (AI-powered self-publishing SaaS platform, pre-Series A). 

Pillar definition: ${pillar.definition}

For each KPI include: KPI name (bold), definition in self-publishing context, measurement method, reporting frequency, baseline value, 12-month target, warning threshold, and strategic significance to investors.

Format as professional HTML using <h3>, <p>, <ul>, <li>, <strong> tags only, no inline styles. Be specific with numbers.

Return JSON: { "content": "HTML content" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });

      return Response.json({ success: true, pillar: pillar_name, content: result.content });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});