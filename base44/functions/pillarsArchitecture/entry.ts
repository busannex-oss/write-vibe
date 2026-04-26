import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  pillars: [
    {
      name: "Authentic Voice",
      color: "#f59e0b",
      definition: "Every author's unique perspective, style, and creative vision is preserved and amplified — never homogenized — through every AI-assisted step of the publishing journey.",
      core_functions: [
        "Voice fingerprinting: AI learns and matches each author's tone, vocabulary, and cadence before writing begins",
        "Creative sovereignty: Authors retain full editorial control; AI suggests, never overrides",
        "Identity preservation: Character voice, narrative perspective, and cultural authenticity are protected across all manuscript AI interactions"
      ],
      platform_elements: [
        "Manuscript Writer with voice matching",
        "Character Creator with author-defined traits",
        "AI Feedback Engine (show vs. tell, pacing analysis)",
        "Author Profile & Vision Setup in onboarding",
        "Chapter Version History for creative control",
        "Brand Sentinel monitoring voice consistency"
      ],
      agents: ["Brand Sentinel", "Structure Sentinel", "Character Creator Agent", "Manuscript Writer AI"],
      coverage_score: 88,
      gaps: ["Formal voice fingerprinting not yet instrumented", "Multi-author collaboration voice blending tool planned V3"],
      competitive_advantage: "Authors stay on The Write Vibe because their book sounds like them — not like every other AI-generated book on Amazon."
    },
    {
      name: "Professional Quality",
      color: "#3b82f6",
      definition: "Every output produced on The Write Vibe — manuscript, cover, audiobook, metadata — meets or exceeds the standards of traditional publishing houses, without requiring authors to know those standards.",
      core_functions: [
        "Industry-standard formatting: KDP, ACX, and IngramSpark compliance built into every export",
        "Quality gates: Automated manuscript health checks, metadata validation, and cover dimension compliance before submission",
        "Publishing-grade outputs: Cover resolution, audiobook bit rate, manuscript typography, and Amazon category optimization all calibrated to industry spec"
      ],
      platform_elements: [
        "Manuscript Formatter (KDP-ready)",
        "Cover Designer (print and digital specs)",
        "Distribution Dashboard with metadata validation",
        "Book Health Check automated scoring",
        "Amazon KDP and ACX submission pipeline",
        "Audiobook Producer with audio quality standards",
        "SEO Metadata Editor with category optimization"
      ],
      agents: ["Text Formatter Agent", "Bookstore Advisor Agent", "Diagnostics Agent", "SEO Growth Engine"],
      coverage_score: 92,
      gaps: ["IngramSpark integration planned V2", "Print-on-demand quality preview tool in roadmap"],
      competitive_advantage: "Authors publishing through The Write Vibe are indistinguishable from authors with traditional publishing teams — at a fraction of the cost and time."
    },
    {
      name: "Accessible Empowerment",
      color: "#10b981",
      definition: "The full power of professional publishing is available to every author regardless of technical skill, industry knowledge, publishing budget, or prior experience.",
      core_functions: [
        "Zero-barrier onboarding: Authors create their first book project within minutes, with AI guiding every decision",
        "Plain-language publishing: Industry jargon translated into author-friendly language across the entire platform",
        "Progressive capability: Authors unlock more advanced features as their confidence and output grow"
      ],
      platform_elements: [
        "8-step guided onboarding experience",
        "AI-driven project creation wizard",
        "Unified Outline Generator",
        "Title Suggester (no marketing knowledge required)",
        "One-click KDP and ACX submission",
        "Book Website Builder (no coding)",
        "Pricing tiers from $29/month"
      ],
      agents: ["Project Manager Agent", "Membership Manager Agent", "Title Suggester Agent", "Outline Generator Agent", "Website Builder Agent"],
      coverage_score: 85,
      gaps: ["Mobile-first experience not yet optimized", "Accessibility features (screen reader, dyslexia fonts) planned V3"],
      competitive_advantage: "The Write Vibe's addressable market is every person with a story — not just tech-savvy authors. This is a 10x TAM expansion vs. traditional publishing tool competitors."
    },
    {
      name: "Ethical AI",
      color: "#8b5cf6",
      definition: "AI on The Write Vibe is a transparent, accountable tool in service of the author — never an extractive system that exploits author creativity, data, or intellectual property.",
      core_functions: [
        "IP sovereignty: Authors own 100% of all content created using platform AI tools, with no platform claim on manuscripts",
        "Transparent AI: Every AI action is visible, reversible, and explainable — authors always know when AI was involved",
        "Data protection: Author manuscripts, characters, and creative work are never used to train external AI models"
      ],
      platform_elements: [
        "Author IP ownership guarantee in Terms of Service",
        "AI action transparency logs",
        "Chapter Version History (full reversibility)",
        "Agent Memory Log (AI decision audit trail)",
        "Error Dashboard (platform accountability)",
        "Legal Documents framework (Privacy Policy, ToS)"
      ],
      agents: ["Diagnostics Agent", "Brand Guardian Agent"],
      coverage_score: 72,
      gaps: ["Formal AI transparency dashboard not yet built", "Third-party AI audit planned pre-Series A", "Author data portability export tool planned V2"],
      competitive_advantage: "In a market where author trust in AI is eroding, The Write Vibe's ethical AI framework is a retention moat — authors stay where their IP is safe."
    },
    {
      name: "Community & Legacy",
      color: "#ec4899",
      definition: "Every author who publishes through The Write Vibe joins a living community of writers building lasting literary legacies — supported, celebrated, and connected to a movement larger than any single book.",
      core_functions: [
        "Milestone celebration: Every publishing achievement — first chapter, first cover, first live book — is acknowledged and celebrated within the platform",
        "Author success cadence: 30/60/90-day check-ins ensure no author feels alone in their publishing journey",
        "Legacy infrastructure: Book websites, author profiles, and review systems create permanent digital presence for every author's work"
      ],
      platform_elements: [
        "Review Management system",
        "Book Website Builder with storefront",
        "Collaboration Panel (team publishing)",
        "Agent Portal (literary agent integration)",
        "Author success check-in system",
        "Newsletter and marketing campaign tools"
      ],
      agents: ["Marketing Assistant Agent", "Seasonal Newsletter Strategist", "Lead Magnet Designer", "Website Builder Agent"],
      coverage_score: 65,
      gaps: ["Author community forum not yet built — highest priority V2 feature", "Author-to-author mentorship system planned V3", "Live publishing milestone celebrations not yet automated"],
      competitive_advantage: "Authors don't just publish — they build a career. The community layer creates network effects that make The Write Vibe a platform authors never want to leave."
    },
    {
      name: "Innovation Leadership",
      color: "#06b6d4",
      definition: "The Write Vibe is always at the frontier of what AI can do for independent authors — deploying new capabilities faster than any competitor and setting the standard for what an AI publishing platform can be.",
      core_functions: [
        "Agent ecosystem: 19 specialized AI agents covering every stage of the publishing workflow — more than any competitor",
        "Continuous feature delivery: New tools shipped every sprint, with authors notified and onboarded to each capability",
        "Industry-first capabilities: AI audiobook production, AI book commercial video, and AI cover design with author voting are category-defining features"
      ],
      platform_elements: [
        "19 Active AI Agents across the publishing workflow",
        "AI Book Commercial Video production",
        "AI Audiobook with voice selection",
        "AI Cover Design with multi-generation voting",
        "AI Character Relationship Mapper",
        "Agent Memory system for continuous AI learning",
        "Version Roadmap V2–V5 with quarterly releases"
      ],
      agents: ["All 19 active agents", "Video Producer Agent", "Audiobook Producer Agent", "Cover Designer Agent"],
      coverage_score: 90,
      gaps: ["Real-time co-writing AI (multiple authors simultaneously) planned V4", "AI developmental editing (full manuscript critique) planned V3"],
      competitive_advantage: "When authors ask 'can the platform do X?' — The Write Vibe's answer is almost always yes, or 'it's in the next release.' This is a category-defining pace of innovation."
    },
    {
      name: "Sustainable Business",
      color: "#84cc16",
      definition: "The Write Vibe operates on a business model that is fair to authors, profitable for the platform, and designed to fund the 30-year mission of becoming the world's leading independent publishing institution.",
      core_functions: [
        "Fair author pricing: Four subscription tiers ($29–$499/month) ensure every author level can access professional publishing tools",
        "White-label licensing: Platform revenue diversified through agent and enterprise licensing at 12–18% revenue share",
        "30-year capital plan: Revenue model designed to fund continuous platform development through bootstrap, angel, Series A, and beyond"
      ],
      platform_elements: [
        "Four-tier subscription model (Starter, Professional, Enterprise, White Label)",
        "Licensing Terms & Boundaries framework",
        "KPI & Success Metrics Framework",
        "Payments & Accounting infrastructure",
        "Revenue reporting and compliance systems",
        "White-label partner pipeline"
      ],
      agents: ["Membership Manager Agent", "Project Manager Agent"],
      coverage_score: 70,
      gaps: ["Author referral and affiliate revenue program not yet built", "Usage-based pricing model analysis planned V2", "Author success revenue share (royalty participation) under consideration"],
      competitive_advantage: "A platform that authors can afford to use for life — not a one-time tool. Subscription LTV + white-label licensing creates two compounding revenue streams."
    },
    {
      name: "Brand Integrity",
      color: "#f97316",
      definition: "The Write Vibe's identity, standards, and promise are delivered consistently across every author touchpoint, every platform deployment, and every piece of content that leaves the platform — protecting both the platform brand and each author's personal brand.",
      core_functions: [
        "Platform-wide standards: Every feature, interaction, and output is governed by the 8-pillar framework and documented SOPs",
        "Author brand protection: The Brand Sentinel ensures author content maintains their established voice, tone, and style across all marketing materials",
        "White-label integrity: Licensed deployments maintain The Write Vibe's quality standards regardless of the licensee's brand identity"
      ],
      platform_elements: [
        "Brand Style Guide (generated and versioned)",
        "SOPs framework (standard operating procedures)",
        "Brand Sentinel AI agent",
        "Pillar Alignment scoring system",
        "Master Element Registry",
        "Map Legend and System Architecture docs",
        "Licensing compliance standards"
      ],
      agents: ["Brand Sentinel", "Brand Guardian Agent", "Structure Sentinel"],
      coverage_score: 83,
      gaps: ["Automated brand compliance audit tool not yet built", "White-label brand differentiation framework in progress"],
      competitive_advantage: "Investors and agents trust The Write Vibe because the brand is defensible — documented, measured, and actively monitored. This is rare at the early-growth stage."
    }
  ],
  master_elements: [
    "Manuscript writing pipeline", "Cover design system", "Audiobook production", "Marketing suite",
    "Distribution dashboard", "Agent portal", "Book website builder", "Review management",
    "Character creation tools", "Outline generation", "SEO metadata tools", "Collaboration system",
    "AI feedback engine", "Health check system", "Analytics dashboard", "Agent memory system",
    "Licensing framework", "Legal document generator", "KPI framework", "Onboarding experience"
  ],
  foundational_docs: [
    { name: "Mission Statement", status: "complete" },
    { name: "Brand Style Guide", status: "complete" },
    { name: "Pillar Alignment Report", status: "complete" },
    { name: "Master Element Registry", status: "complete" },
    { name: "System Architecture", status: "complete" },
    { name: "Sitemap", status: "complete" },
    { name: "SOPs Framework", status: "complete" },
    { name: "Legal Documents (Privacy/ToS)", status: "complete" },
    { name: "Licensing Terms & Boundaries", status: "complete" },
    { name: "KPI Framework", status: "complete" },
    { name: "Onboarding Experience Design", status: "complete" },
    { name: "Version Roadmap V1–V5", status: "complete" },
    { name: "Map Legend", status: "complete" }
  ]
};

function buildMermaidSyntax(pillars) {
  const lines = ['mindmap', '  root((The Write Vibe))'];
  pillars.forEach(p => {
    const safeName = p.name.replace(/[&]/g, 'and').replace(/[^\w\s]/g, '').trim();
    lines.push(`    ${safeName}[${safeName}]`);
    p.platform_elements.slice(0, 3).forEach(el => {
      const safeEl = el.replace(/[&()/[\]{}]/g, '').replace(/\s+/g, ' ').trim().substring(0, 30);
      lines.push(`      ${safeEl}`);
    });
  });
  return lines.join('\n');
}

function buildDocHTML(content, generatedDate, versionNumber, mermaidSyntax) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;color:#1e293b;line-height:1.75;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a 0%,#1a0a2e 60%,#0f1a2e 100%);padding:52px 48px 44px;">
    <p style="color:#f59e0b;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">The Write Vibe · Strategic Architecture · Investor & Agent Confidential</p>
    <h1 style="font-size:36px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;line-height:1.1;">8 Pillars Architecture</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 6px;">How Every Element of The Write Vibe Maps to Its 8 Foundational Pillars</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">The Write Vibe — AI-Powered Self-Publishing Platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:16px 24px;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Doc Version</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Generated</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${generatedDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Pillars</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">8 of 8</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Foundational Docs</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">13 Complete</p></div>
    </div>
  </div>

  <!-- Mermaid syntax stored as data attribute for export -->
  <div id="mermaid-data" data-syntax="${encodeURIComponent(mermaidSyntax)}" style="display:none;"></div>

  <div style="padding:48px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 48px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. Investor & Agent Confidential.</p>
    <p style="color:#cbd5e1;font-size:11px;margin:6px 0 0;">8 Pillars Architecture v${versionNumber} · Generated ${generatedDate} · investors@thewritevibe.com</p>
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
    const DOC_TYPE = 'pillars_architecture';

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
        is_current: d.is_current, generation_notes: d.generation_notes,
        mermaid_syntax: d.risk_analysis?.mermaid_syntax || ''
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

    if (action === 'get_mermaid') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const doc = all.find(d => d.doc_type === DOC_TYPE && d.is_current) || all.find(d => d.doc_type === DOC_TYPE);
      const syntax = doc?.risk_analysis?.mermaid_syntax || buildMermaidSyntax(PLATFORM_CONTEXT.pillars);
      return Response.json({ success: true, mermaid_syntax: syntax });
    }

    if (action === 'generate') {
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const mermaidSyntax = buildMermaidSyntax(PLATFORM_CONTEXT.pillars);
      const avgScore = Math.round(PLATFORM_CONTEXT.pillars.reduce((s, p) => s + p.coverage_score, 0) / PLATFORM_CONTEXT.pillars.length);

      const pillarSummary = PLATFORM_CONTEXT.pillars.map(p =>
        `${p.name} (${p.coverage_score}/100): ${p.definition.substring(0, 120)}...`
      ).join('\n');

      // Generate intro + closing sections first, then all 8 pillars in parallel
      const [introResult, closingResult, ...pillarResults] = await Promise.all([
        // Section 1: Executive Summary
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a senior platform architect and investor relations strategist for The Write Vibe — an AI-powered self-publishing platform with 8 brand pillars.

Pillars overview:
${pillarSummary}

Generate SECTION 1: EXECUTIVE SUMMARY — THE 8-PILLAR ARCHITECTURE PHILOSOPHY
Write 2-3 paragraphs: What the 8-pillar framework is, why it is the strategic backbone of The Write Vibe, how it differs from a typical product feature list, and what it tells investors about long-term defensibility. Be authoritative and investor-facing.

Return JSON: { "title": "Executive Summary — The 8-Pillar Architecture Philosophy", "content": "HTML using <p><strong><em><ul><li> only, no inline styles" }`,
          response_json_schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } }
        }),
        // Sections 10+11: Health + Investor Insight
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a senior platform architect for The Write Vibe — an AI-powered self-publishing platform.

Pillar coverage scores:
${PLATFORM_CONTEXT.pillars.map(p => `${p.name}: ${p.coverage_score}/100`).join('\n')}
Overall average: ${avgScore}/100

Generate TWO sections as a JSON array:
1. OVERALL PILLAR HEALTH ASSESSMENT: weighted health score table, top 3-4 platform strengths, top 3-4 priority development areas, pillar interdependencies.
2. INVESTOR INSIGHT SUMMARY: 2-3 paragraphs for investors on why the 8-pillar architecture is a defensible moat, how scores evolve V2-V5, connection between pillar maturity and author LTV and valuation.

Return JSON: { "sections": [ { "title": "...", "content": "HTML using <h3><h4><p><ul><li><table><tr><th><td><strong> only" }, { "title": "...", "content": "..." } ] }`,
          response_json_schema: { type: "object", properties: { sections: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } } } }
        }),
        // All 8 pillars in parallel
        ...PLATFORM_CONTEXT.pillars.map(p =>
          base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are a senior platform architect writing a pillar section for The Write Vibe's 8 Pillars Architecture investor document.

PILLAR: ${p.name} (Coverage Score: ${p.coverage_score}/100)
Definition: ${p.definition}
Core Functions: ${p.core_functions.join(' | ')}
Platform Elements: ${p.platform_elements.join(', ')}
AI Agents: ${p.agents.join(', ')}
Strategic Gaps: ${p.gaps.join('; ')}
Competitive Advantage: ${p.competitive_advantage}

Write a complete pillar section including: visual coverage bar (use block chars like ████████░░), definition, three core functions, active platform elements (with brief notes), AI agents and their role, coverage assessment, strategic gaps, and competitive advantage. Be specific, investor-facing, authoritative.

Return JSON: { "title": "${p.name}", "content": "HTML using <h3><h4><p><ul><li><strong><em> only, no inline styles" }`,
            response_json_schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } }
          })
        )
      ]);

      // Assemble sections in order: intro, 8 pillars, closing 2
      const allSections = [
        introResult,
        ...pillarResults,
        ...(closingResult.sections || [])
      ].filter(Boolean);

      const result = { sections: allSections };

      const pillarColors = PLATFORM_CONTEXT.pillars.map(p => p.color);

      const innerHtml = (result.sections || []).map((sec, idx) => {
        const isPillar = idx >= 1 && idx <= 8;
        const accent = isPillar ? pillarColors[idx - 1] : '#f59e0b';
        const pillar = isPillar ? PLATFORM_CONTEXT.pillars[idx - 1] : null;
        return `
<div style="margin-bottom:52px;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
    <div style="width:40px;height:40px;border-radius:10px;background:${accent}18;border:2px solid ${accent}35;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:${accent};font-size:13px;font-weight:800;">${isPillar ? idx : '★'}</span>
    </div>
    <div>
      <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.5px;">${sec.title}</h2>
      ${pillar ? `<p style="color:${accent};font-size:11px;font-weight:700;margin:2px 0 0;text-transform:uppercase;letter-spacing:2px;">Coverage Score: ${pillar.coverage_score}/100</p>` : ''}
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}00);border-radius:2px;margin-bottom:22px;"></div>
  <div style="font-size:14px;line-height:1.85;color:#374151;">${sec.content}</div>
</div>`;
      }).join('');

      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      const latestVersion = sameType[0]?.version_number || 0;
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: false })));

      const content_html = buildDocHTML(innerHtml, generatedDate, latestVersion + 1, mermaidSyntax);

      const saved = await base44.asServiceRole.entities.LegalDocument.create({
        doc_type: DOC_TYPE,
        version_number: latestVersion + 1,
        title: 'The Write Vibe — 8 Pillars Architecture',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        risk_analysis: { mermaid_syntax: mermaidSyntax, overall_risk: 'low' },
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · 8 pillars · avg score ${avgScore}/100`
      });

      return Response.json({ success: true, doc: saved, mermaid_syntax: mermaidSyntax });
    }

    if (action === 'regenerate_pillar') {
      const { pillar_name } = body;
      const pillar = PLATFORM_CONTEXT.pillars.find(p => p.name === pillar_name) || { name: pillar_name };

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior platform architect. Rewrite the "${pillar_name}" pillar section of The Write Vibe's 8 Pillars Architecture document.

Pillar data:
- Definition: ${pillar.definition || ''}
- Coverage Score: ${pillar.coverage_score || 'TBD'}/100
- Core Functions: ${(pillar.core_functions||[]).join('; ')}
- Platform Elements: ${(pillar.platform_elements||[]).join(', ')}
- Agents: ${(pillar.agents||[]).join(', ')}
- Gaps: ${(pillar.gaps||[]).join('; ')}
- Competitive Advantage: ${pillar.competitive_advantage || ''}

Include all subsections: Definition, Three Core Functions, Active Platform Elements, AI Agents, Coverage Assessment, Strategic Gaps, Competitive Advantage. Be specific, investor-facing, and authoritative.

Format as professional HTML using <h3>, <h4>, <p>, <ul>, <li>, <strong> tags only, no inline styles.
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