import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  current_version: "V1.0 — Foundation Release",
  tagline: "AI-Powered Self-Publishing Platform for Independent Authors",
  current_features: [
    "AI Manuscript Writing — chapter-by-chapter with author voice preservation",
    "Title Suggester Agent — commercially viable title generation",
    "Unified Outline Generator — table of contents, detailed outline, industry-standard scene breakdown",
    "Cover Designer — AI front and back cover generation with style selection and voting",
    "Manuscript Formatter — KDP and ACX-ready formatting output",
    "Audiobook Producer — AI voice narration with script review",
    "Marketing Campaign Generator — social posts, email sequences, ad copy",
    "SEO Metadata Editor — Amazon keyword and category optimization",
    "Book Summary Writer — back-cover description generation",
    "Character Creator — deep character profiles with backstory, traits, appearance",
    "Book Website Builder — author site with storefront integration",
    "Amazon KDP Integration — one-click submission with validation dashboard",
    "Amazon ACX Integration — audiobook distribution pipeline",
    "Distribution Dashboard — real-time metadata validation and compliance alerts",
    "Agent Portal — secure tokenized access for literary agents with comment system",
    "AI Feedback Engine — chapter-level analysis for pacing, dialogue, show vs. tell",
    "Collaboration Panel — team member roles and task management",
    "Review Management — reader review collection and moderation",
    "Error Dashboard — real-time platform health monitoring",
    "Book Health Check — automated manuscript quality scoring"
  ],
  active_agents: [
    "Brand Sentinel — brand consistency guardian across all content",
    "Structure Sentinel — manuscript structure and narrative arc monitor",
    "SEO Growth Engine — continuous keyword and discoverability optimization",
    "Marketing Assistant — campaign ideation and copy generation",
    "Character Creator Agent — AI-driven character development",
    "Outline Generator Agent — intelligent chapter architecture",
    "Title Suggester Agent — market-aware title generation",
    "Summary Writer Agent — compelling book description crafting",
    "Cover Designer Agent — visual style selection and image generation",
    "Audiobook Producer Agent — narration style and script management",
    "Website Builder Agent — author site content and structure",
    "Bookstore Advisor Agent — distribution channel strategy",
    "Lead Magnet Designer — reader acquisition asset creation",
    "Text Formatter Agent — platform-standard formatting application",
    "Seasonal Newsletter Strategist — author marketing calendar management",
    "Video Producer Agent — book commercial creation pipeline",
    "Diagnostics Agent — platform and workflow issue detection",
    "Project Manager Agent — book production timeline orchestration",
    "Membership Manager Agent — subscription and access management"
  ],
  pillars: [
    { name: "Authentic Voice", coverage: "Strong — voice preservation tools active" },
    { name: "Professional Quality", coverage: "Strong — KDP/ACX-grade outputs across all tools" },
    { name: "Accessible Empowerment", coverage: "Strong — no publishing knowledge required" },
    { name: "Ethical AI", coverage: "Developing — author IP protections in place, transparency docs in progress" },
    { name: "Community & Legacy", coverage: "Early — review system active, community features planned" },
    { name: "Innovation Leadership", coverage: "Strong — 19 AI agents deployed, continuous feature delivery" },
    { name: "Sustainable Business", coverage: "Developing — tiered pricing live, white-label pipeline open" },
    { name: "Brand Integrity", coverage: "Strong — brand sentinel, style guide, SOP framework active" }
  ],
  kpi_gaps: [
    "Author NPS not yet formally measured — target 70+",
    "Onboarding completion rate tracking not instrumented — target 70%+ in 30 days",
    "Monthly active author count in early growth phase — target 10,000 by Month 24",
    "ARR not yet at $1M — target $5M by end of Year 2",
    "White-label partnerships pipeline open — target 5 by Year 3",
    "International market presence — target 3 markets by Year 4"
  ],
  distribution_pipeline: [
    "Amazon KDP — live",
    "Amazon ACX — live",
    "Author book websites — live",
    "IngramSpark — planned V2",
    "Barnes & Noble Press — planned V2",
    "Draft2Digital — planned V3",
    "Apple Books Direct — planned V3",
    "Kobo Writing Life — planned V3",
    "Google Play Books — planned V4",
    "International Amazon markets (UK, CA, AU, DE) — planned V4"
  ],
  strategic_milestones: [
    "Year 1: Establish core platform, 1,000 active authors, $500K ARR",
    "Year 2: 10,000 active authors, $5M ARR, Series A raise",
    "Year 3: 5 white-label partnerships, international expansion, $15M ARR",
    "Year 4: 50,000 authors, enterprise tier, $40M ARR",
    "Year 5: Market leadership in AI self-publishing, $80M ARR",
    "Year 10: Publishing ecosystem platform, 500,000 authors, global presence",
    "Year 30: Legacy institution in independent publishing, author wealth creation platform"
  ]
};

const VERSION_THEMES = [
  { version: "V2.0", theme: "Distribution Expansion & Community", period: "Q3–Q4 2026" },
  { version: "V3.0", theme: "Intelligence Layer & Global Reach", period: "Q1–Q2 2027" },
  { version: "V4.0", theme: "Enterprise & Ecosystem Platform", period: "Q3–Q4 2027" },
  { version: "V5.0", theme: "Market Leadership & Author Wealth", period: "2028" }
];

function buildDocHTML(content, generatedDate, versionNumber) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;color:#1e293b;line-height:1.75;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a 0%,#1a1040 60%,#0f1a2e 100%);padding:52px 48px 44px;">
    <p style="color:#f59e0b;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">The Write Vibe · Strategic Document · Investor & Agent Confidential</p>
    <h1 style="font-size:36px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;line-height:1.1;">Version Roadmap</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 6px;">Platform Evolution V1 → V5 and the 36-Month Vision</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">The Write Vibe — AI-Powered Self-Publishing Platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:16px 24px;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Doc Version</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Generated</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${generatedDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Platform Versions</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">V1 → V5</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Horizon</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">36 Months</p></div>
    </div>
  </div>

  <div style="background:#fefce8;border-bottom:1px solid #fde68a;padding:16px 28px;">
    <p style="color:#92400e;font-size:12px;margin:0;line-height:1.8;"><strong>📍 Roadmap Note:</strong> This Version Roadmap was generated by AI using The Write Vibe's current platform state, strategic milestones, pillar alignment data, and distribution pipeline. Release periods and feature sets are forward-looking projections for investor and agent communication purposes. Actual releases may be accelerated or adjusted based on capital, market conditions, and author demand signals.</p>
  </div>

  <div style="padding:48px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 48px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. Investor & Agent Confidential.</p>
    <p style="color:#cbd5e1;font-size:11px;margin:6px 0 0;">Version Roadmap v${versionNumber} · Generated ${generatedDate} · investors@thewritevibe.com</p>
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
    const DOC_TYPE = 'version_roadmap';

    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const doc = all.find(d => d.doc_type === DOC_TYPE && d.is_current)
                || all.find(d => d.doc_type === DOC_TYPE)
                || null;
      return Response.json({ success: true, doc });
    }

    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const versions = all.filter(d => d.doc_type === DOC_TYPE).map(d => ({
        id: d.id, version_number: d.version_number, generated_at: d.generated_at,
        is_current: d.is_current, generation_notes: d.generation_notes
      }));
      return Response.json({ success: true, versions });
    }

    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: d.id === id })));
      const restored = sameType.find(d => d.id === id);
      return Response.json({ success: true, doc: restored });
    }

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

    if (action === 'generate') {
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const contextBlock = `
CURRENT VERSION: ${PLATFORM_CONTEXT.current_version}

DEPLOYED FEATURES (${PLATFORM_CONTEXT.current_features.length} total):
${PLATFORM_CONTEXT.current_features.join('\n')}

ACTIVE AI AGENTS (${PLATFORM_CONTEXT.active_agents.length} total):
${PLATFORM_CONTEXT.active_agents.join('\n')}

PILLAR COVERAGE:
${PLATFORM_CONTEXT.pillars.map(p => `- ${p.name}: ${p.coverage}`).join('\n')}

KPI GAPS TO CLOSE:
${PLATFORM_CONTEXT.kpi_gaps.join('\n')}

DISTRIBUTION PIPELINE:
${PLATFORM_CONTEXT.distribution_pipeline.join('\n')}

30-YEAR STRATEGIC MILESTONES:
${PLATFORM_CONTEXT.strategic_milestones.join('\n')}

PLANNED VERSION THEMES:
${VERSION_THEMES.map(v => `${v.version} (${v.period}): ${v.theme}`).join('\n')}`;

      const prompt = `You are a senior product strategist and investor relations specialist at a venture-backed AI SaaS company. Generate a complete, professional Version Roadmap document for The Write Vibe — an AI-powered self-publishing platform.

PLATFORM CONTEXT:
${contextBlock}

Generate ALL sections in this exact order:

SECTION 1: EXECUTIVE SUMMARY — ROADMAP PHILOSOPHY
2-3 paragraphs: What this roadmap represents, The Write Vibe's product vision, how each version builds on the last, and the overarching trajectory from "great publishing tools" to "the definitive platform for independent author success." Write with confidence and investor-grade clarity.

SECTION 2: CURRENT VERSION — V1.0 FOUNDATION RELEASE
Subsections:
- Deployed Features Summary (group the 20 deployed features into 5-6 logical categories with brief descriptions)
- Active AI Publishing Tools (describe the 19 agents and their publishing workflow roles, grouped by function)
- Platform Pillar Coverage (assess each of the 8 pillars, noting strengths and development areas)
- Current Performance Baseline (honest, forward-looking framing of where the platform is now and what's being instrumented)

SECTIONS 3-6: V2.0 THROUGH V5.0 — UPCOMING VERSIONS
For EACH version (V2, V3, V4, V5), generate a complete version block including:
- Version Number, Theme, and Target Release Period
- Strategic Rationale (why this version, why now, what market signal or author need drives it)
- New Publishing Features (specific, named features — be creative and realistic for an AI publishing platform)
- AI Tool Additions & Upgrades (new agents or major agent upgrades)
- Pillar Improvements & Coverage Gains (which gaps close, which pillars strengthen)
- Author Experience Enhancements (how the author journey improves)
- Distribution Expansion Targets (which new channels open, which markets)
- Revenue Impact Projections Framing (how this version unlocks new revenue — subscription tier expansion, new use cases, white-label appeal — use ranges not exact figures)
- Dependencies & Prerequisites (what must be true before this version ships — capital, team, partnerships, data)

SECTION 7: LONG-TERM TRAJECTORY
Three forward-looking visions, each 1-2 paragraphs:
- 12-Month Platform Vision (post-V2, what The Write Vibe looks and feels like)
- 24-Month Market Position Vision (post-V3, competitive standing, author base, revenue tier)
- 36-Month Vision Aligned to 30-Year Plan (how V1-V4 lay the foundation for the 30-year legacy platform)

SECTION 8: INVESTOR FRAMING — WHY THIS ROADMAP IS FUNDABLE
A direct investor-facing section (2-3 paragraphs) explaining:
- How each version de-risks the investment thesis
- The network effects that kick in at scale
- Why the roadmap sequence creates a defensible moat
- The total addressable market expansion each version unlocks

Format with clean, professional HTML using <h2>, <h3>, <h4>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong> tags only. NO inline styles. Use precise, confident business language. Make version features specific and named — not generic. Each version section should feel like a real product planning document.

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

      const versionColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

      const innerHtml = (result.sections || []).map((sec, idx) => {
        const accent = versionColors[idx % versionColors.length];
        const isVersion = sec.title.match(/V[2-5]/i);
        return `
<div style="margin-bottom:52px;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <div style="width:36px;height:36px;border-radius:8px;background:${accent}18;border:1px solid ${accent}35;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:${accent};font-size:12px;font-weight:800;">${isVersion ? sec.title.match(/V\d/i)?.[0] || (idx+1) : idx+1}</span>
    </div>
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.5px;">${sec.title}</h2>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}00);border-radius:2px;margin-bottom:22px;"></div>
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
        title: 'The Write Vibe — Version Roadmap V1→V5',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · V1–V5 · 36-month trajectory`
      });

      return Response.json({ success: true, doc: saved });
    }

    if (action === 'regenerate_version') {
      const { version_label } = body;
      const vTheme = VERSION_THEMES.find(v => v.version === version_label) || { theme: version_label, period: 'TBD' };

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior product strategist. Rewrite the ${version_label} section of The Write Vibe's Version Roadmap.

Version theme: "${vTheme.theme}", target period: ${vTheme.period}.

Include all subsections: Strategic Rationale, New Publishing Features, AI Tool Additions & Upgrades, Pillar Improvements, Author Experience Enhancements, Distribution Expansion Targets, Revenue Impact Projections Framing, Dependencies & Prerequisites.

Make features specific and named. Be confident and precise. Format as professional HTML using <h3>, <h4>, <p>, <ul>, <li>, <strong> tags only, no inline styles.
Return JSON: { "content": "HTML content" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });
      return Response.json({ success: true, version: version_label, content: result.content });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});