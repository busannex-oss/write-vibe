import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];

// ── Site Foundation Standard — 17 items across 6 categories ───────────────────
const FOUNDATION_CATEGORIES = [
  {
    id: "brand_identity",
    name: "Brand Identity & Positioning",
    icon: "🎨",
    strategic_purpose: "Defines the visual and verbal identity of the platform, ensuring consistent representation to investors, agents, and authors across all touchpoints.",
    items: [
      { id: "mission_statement", name: "Mission Statement", status: "complete", description: "Live versioned mission document with AI scoring and pillar alignment analysis", pillars: ["Authenticity", "Integrity"] },
      { id: "brand_style_guide", name: "Brand Style Guide", status: "complete", description: "Complete visual identity system — colors, typography, voice, positioning, component guidelines", pillars: ["Authenticity", "Creativity", "Excellence"] },
      { id: "pillar_framework", name: "8-Pillar Brand Framework", status: "complete", description: "Core brand pillars embedded across all platform operations: Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth", pillars: ["Authenticity", "Integrity"] }
    ]
  },
  {
    id: "platform_architecture",
    name: "Platform Architecture & Mapping",
    icon: "🏛️",
    strategic_purpose: "Documents the complete structural design of the platform — pages, systems, relationships, and navigation hierarchy — for technical due diligence and investor comprehension.",
    items: [
      { id: "sitemap", name: "Platform Sitemap", status: "complete", description: "Full page inventory across 4 zones with pillar alignment and strategic roles per page", pillars: ["Innovation", "Excellence"] },
      { id: "master_registry", name: "Master Element Registry", status: "complete", description: "Comprehensive inventory of all 17 platform elements with status, purpose, dependencies, and strategic value", pillars: ["Excellence", "Integrity"] },
      { id: "map_legend", name: "Architecture Map Legend", status: "complete", description: "Visual legend for platform architecture diagrams — element types, relationship types, status indicators", pillars: ["Innovation", "Excellence"] },
      { id: "system_architecture", name: "System Architecture Document", status: "complete", description: "Investor & agent facing full organizational structure document with AI-generated analysis across all 6 SFS categories", pillars: ["Innovation", "Excellence", "Integrity"] }
    ]
  },
  {
    id: "ai_operations",
    name: "AI Agent & Automation Infrastructure",
    icon: "🤖",
    strategic_purpose: "Demonstrates the platform's AI-native operational backbone — autonomous agents, memory systems, and workflow automations that differentiate the platform from competitors.",
    items: [
      { id: "agent_memory", name: "Agent Memory Log", status: "complete", description: "AI agent memory ledger with semantic tagging, importance scoring, and session tracking across all agents", pillars: ["Innovation", "Integrity"] },
      { id: "agent_manifest", name: "Agent & Automation Manifest", status: "complete", description: "Full registry of AI agents (brand_strategist, character_creator, marketing_assistant, etc.) and automated workflows", pillars: ["Innovation", "Excellence"] },
      { id: "sop_library", name: "AI-Generated SOP Library", status: "complete", description: "Standard Operating Procedures with AI generation from project documentation, pillar alignment, and version control", pillars: ["Excellence", "Integrity", "Empowerment"] }
    ]
  },
  {
    id: "strategic_reporting",
    name: "Strategic Reporting & Alignment",
    icon: "📊",
    strategic_purpose: "Provides investors and leadership with real-time visibility into platform performance, brand coherence, and strategic trajectory through AI-generated analysis.",
    items: [
      { id: "pillar_alignment", name: "Pillar Alignment Report", status: "complete", description: "8-pillar scorecard with per-pillar analysis, gap identification, 12-month roadmap, and investor insights", pillars: ["Authenticity", "Growth", "Excellence"] },
      { id: "project_reports", name: "Project Progress Reports", status: "complete", description: "AI-generated per-book status reports with milestone tracking, completion scoring, and timeline analysis", pillars: ["Excellence", "Growth"] },
      { id: "error_dashboard", name: "Platform Error Dashboard", status: "complete", description: "Runtime error monitoring with severity categorization, resolution tracking, and operational health metrics", pillars: ["Excellence", "Integrity"] }
    ]
  },
  {
    id: "product_platform",
    name: "Core Product Platform",
    icon: "⚡",
    strategic_purpose: "The primary author-facing product layer — the AI-powered book creation studio that delivers core value, drives retention, and generates subscription revenue.",
    items: [
      { id: "book_studio", name: "AI Book Studio (BookEditor)", status: "complete", description: "Full-featured creation environment: AI outline generation, manuscript writing, cover design, audiobook, marketing, Amazon publishing", pillars: ["Creativity", "Innovation", "Excellence"] },
      { id: "team_collab", name: "Team Collaboration Layer", status: "complete", description: "Role-based team management for co-authors, editors, publishers, and marketers with permission controls", pillars: ["Community", "Empowerment"] },
      { id: "white_label", name: "White Label Infrastructure", status: "in_progress", description: "Complete brand customization for enterprise clients — custom domains, logos, colors, and branded experiences", pillars: ["Innovation", "Empowerment"] }
    ]
  },
  {
    id: "legal_compliance",
    name: "Legal, Compliance & Trust",
    icon: "⚖️",
    strategic_purpose: "Establishes the legal and compliance foundation required for investor confidence, enterprise partnerships, and international market expansion.",
    items: [
      { id: "privacy_policy", name: "Privacy Policy (GDPR/CCPA)", status: "complete", description: "Comprehensive data governance policy covering collection, storage, processing, and user rights", pillars: ["Integrity"] },
      { id: "terms_of_service", name: "Terms of Service", status: "complete", description: "Platform usage terms, IP ownership framework, subscription conditions, and dispute resolution", pillars: ["Integrity"] },
      { id: "cookie_policy", name: "Cookie Policy", status: "complete", description: "GDPR-compliant cookie disclosure with opt-out mechanisms for EU market compliance", pillars: ["Integrity"] }
    ]
  }
];

const AGENTS = [
  "brand_strategist", "character_creator", "outline_generator", "marketing_assistant",
  "project_manager", "cover_designer", "audiobook_producer", "website_builder",
  "video_producer", "lead_magnet_designer", "diagnostics_agent", "membership_manager",
  "seasonal_newsletter_strategist", "seo_growth_engine", "brand_sentinel",
  "structure_sentinel", "brand_guardian", "text_formatter", "title_suggester",
  "summary_writer", "bookstore_advisor"
];

function calcScores() {
  const categoryScores = FOUNDATION_CATEGORIES.map(cat => {
    const complete = cat.items.filter(i => i.status === 'complete').length;
    const inProgress = cat.items.filter(i => i.status === 'in_progress').length;
    const score = Math.round(((complete + inProgress * 0.5) / cat.items.length) * 100);
    return { id: cat.id, name: cat.name, score, total: cat.items.length, complete, in_progress: inProgress };
  });
  const totalItems = FOUNDATION_CATEGORIES.reduce((s, c) => s + c.items.length, 0);
  const completeItems = FOUNDATION_CATEGORIES.reduce((s, c) => s + c.items.filter(i => i.status === 'complete').length, 0);
  const inProgressItems = FOUNDATION_CATEGORIES.reduce((s, c) => s + c.items.filter(i => i.status === 'in_progress').length, 0);
  const overall = Math.round(((completeItems + inProgressItems * 0.5) / totalItems) * 100);
  return { categoryScores, overall, totalItems, completeItems, inProgressItems };
}

function buildArchHTML(analysis, scores) {
  const pillarColors = {
    "Authenticity": "#f59e0b", "Creativity": "#a78bfa", "Empowerment": "#22c55e",
    "Innovation": "#06b6d4", "Community": "#ec4899", "Excellence": "#fbbf24",
    "Integrity": "#6366f1", "Growth": "#10b981"
  };

  const statusBadge = (status) => {
    const cfg = status === 'complete' 
      ? { bg: '#22c55e18', border: '#22c55e30', color: '#22c55e', label: '✓ Complete' }
      : status === 'in_progress'
      ? { bg: '#f59e0b18', border: '#f59e0b30', color: '#f59e0b', label: '⟳ In Progress' }
      : { bg: '#64748b18', border: '#64748b30', color: '#64748b', label: '○ Planned' };
    return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};">${cfg.label}</span>`;
  };

  const categoryBlocks = FOUNDATION_CATEGORIES.map((cat, idx) => {
    const catScore = scores.categoryScores.find(s => s.id === cat.id);
    const itemRows = cat.items.map(item => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:12px 16px;">
          <p style="color:#f1f5f9;font-size:13px;font-weight:500;margin:0 0 3px;">${item.name}</p>
          <p style="color:#64748b;font-size:12px;margin:0;line-height:1.5;">${item.description}</p>
        </td>
        <td style="padding:12px 16px;white-space:nowrap;">${statusBadge(item.status)}</td>
        <td style="padding:12px 16px;">
          <div style="display:flex;flex-wrap:wrap;gap:3px;">
            ${(item.pillars||[]).map(p=>`<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;background:${pillarColors[p]||'#64748b'}15;color:${pillarColors[p]||'#94a3b8'};border:1px solid ${pillarColors[p]||'#64748b'}25;">${p}</span>`).join('')}
          </div>
        </td>
      </tr>`).join('');

    const catAnalysis = analysis.categories?.find(c => c.id === cat.id);

    return `
    <div style="margin-bottom:48px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;">${cat.icon}</div>
        <div style="flex:1;">
          <h2 style="font-size:19px;font-weight:700;color:#fff;margin:0 0 2px;">0${idx+1} · ${cat.name}</h2>
          <p style="color:#64748b;font-size:12px;margin:0;">${cat.items.length} items · ${catScore?.complete||0} complete${catScore?.in_progress ? ` · ${catScore.in_progress} in progress` : ''}</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#f59e0b;font-size:22px;font-weight:800;margin:0;">${catScore?.score||0}%</p>
          <div style="width:80px;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;margin-top:4px;">
            <div style="height:100%;width:${catScore?.score||0}%;background:linear-gradient(90deg,#f59e0b,#ea580c);border-radius:2px;"></div>
          </div>
        </div>
      </div>
      <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0 0 16px;padding:12px 16px;background:rgba(255,255,255,0.02);border-left:3px solid rgba(245,158,11,0.3);border-radius:0 8px 8px 0;">${cat.strategic_purpose}</p>
      <div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
        <table style="width:100%;border-collapse:collapse;font-family:system-ui,sans-serif;">
          <thead>
            <tr style="background:rgba(255,255,255,0.02);">
              <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;width:50%;">Element</th>
              <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;white-space:nowrap;">Status</th>
              <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Pillars</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
      ${catAnalysis ? `<div style="margin-top:12px;padding:14px 16px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);border-radius:10px;">
        <p style="color:#818cf8;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Investor Significance</p>
        <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">${catAnalysis.investor_significance}</p>
      </div>` : ''}
    </div>`;
  }).join('');

  const catScoreBars = scores.categoryScores.map(c => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#94a3b8;font-size:12px;">${c.name}</span>
        <span style="color:#f59e0b;font-size:12px;font-weight:600;">${c.score}%</span>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${c.score}%;background:linear-gradient(90deg,#f59e0b,#ea580c);border-radius:3px;"></div>
      </div>
    </div>`).join('');

  const roadmapItems = (analysis.priority_roadmap || []).map((item, i) => `
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      <div style="width:22px;height:22px;border-radius:50%;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;color:#f59e0b;font-size:10px;font-weight:700;shrink:0;">${i+1}</div>
      <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;padding-top:2px;">${item}</p>
    </div>`).join('');

  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:1000px;margin:0 auto;color:#e2e8f0;line-height:1.6;">

  <!-- COVER -->
  <div style="text-align:center;padding:52px 0 44px;border-bottom:2px solid rgba(245,158,11,0.3);margin-bottom:52px;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Confidential · Investor & Agent Document</p>
    <h1 style="font-size:38px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;">The Write Vibe</h1>
    <h2 style="font-size:22px;font-weight:300;color:#94a3b8;margin:0 0 28px;letter-spacing:-0.5px;">System Architecture Document</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">Site Foundation Standard · ${FOUNDATION_CATEGORIES.length} Categories · ${scores.totalItems} Elements</p>
    <div style="display:inline-flex;gap:0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
      <div style="padding:18px 28px;border-right:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#22c55e;font-size:28px;font-weight:800;margin:0;">${scores.overall}%</p>
        <p style="color:#64748b;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">Platform Completion</p>
      </div>
      <div style="padding:18px 28px;border-right:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#fbbf24;font-size:28px;font-weight:800;margin:0;">${scores.completeItems}</p>
        <p style="color:#64748b;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">Elements Complete</p>
      </div>
      <div style="padding:18px 28px;border-right:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#06b6d4;font-size:28px;font-weight:800;margin:0;">${AGENTS.length}+</p>
        <p style="color:#64748b;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">AI Agents</p>
      </div>
      <div style="padding:18px 28px;text-align:center;">
        <p style="color:#a78bfa;font-size:28px;font-weight:800;margin:0;">8</p>
        <p style="color:#64748b;font-size:11px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">Brand Pillars</p>
      </div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:16px;padding:28px;margin-bottom:52px;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Executive Summary</p>
    <p style="color:#cbd5e1;font-size:15px;margin:0;line-height:1.85;">${analysis.executive_summary}</p>
  </div>

  <!-- SIX CATEGORIES -->
  ${categoryBlocks}

  <!-- COMPLETION SCORECARD -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 6px;">Platform Completion Scorecard</h2>
    <p style="color:#64748b;font-size:12px;margin:0 0 20px;">Completion status across all 6 Site Foundation Standard categories</p>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:24px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div>
          <p style="color:#64748b;font-size:12px;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;">Overall Platform Score</p>
          <p style="color:#22c55e;font-size:32px;font-weight:800;margin:0;">${scores.overall}%</p>
        </div>
        <div style="flex:1;height:10px;background:rgba(255,255,255,0.05);border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${scores.overall}%;background:linear-gradient(90deg,#22c55e,#10b981);border-radius:5px;"></div>
        </div>
      </div>
      ${catScoreBars}
    </div>
  </div>

  <!-- PRIORITY ROADMAP -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 6px;">Priority Completion Roadmap</h2>
    <p style="color:#64748b;font-size:12px;margin:0 0 20px;">AI-recommended next steps to achieve 100% Site Foundation Standard completion</p>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:24px;">
      ${roadmapItems}
    </div>
  </div>

  <!-- AGENT MANIFEST SUMMARY -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 6px;">AI Agent Manifest</h2>
    <p style="color:#64748b;font-size:12px;margin:0 0 16px;">${AGENTS.length} specialized AI agents powering The Write Vibe platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${AGENTS.map(a=>`<span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:500;background:rgba(6,182,212,0.08);color:#67e8f9;border:1px solid rgba(6,182,212,0.2);">${a.replace(/_/g,' ')}</span>`).join('')}
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding:32px 0;border-top:1px solid rgba(255,255,255,0.06);margin-top:40px;">
    <p style="color:#334155;font-size:12px;">© ${new Date().getFullYear()} The Write Vibe · System Architecture Document · Confidential · Generated ${new Date().toLocaleDateString()}</p>
  </div>
</div>`;
}

function buildMermaid(scores) {
  const lines = [
    'mindmap',
    '  root((The Write Vibe))',
  ];
  FOUNDATION_CATEGORIES.forEach(cat => {
    const safe = cat.name.replace(/[^a-zA-Z0-9 &]/g, '').replace(/&/g, 'and');
    lines.push(`    ${cat.icon} ${safe}`);
    cat.items.forEach(item => {
      const itemSafe = item.name.replace(/[^a-zA-Z0-9 ]/g, '');
      lines.push(`      ${itemSafe}`);
    });
  });
  return lines.join('\n');
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

    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.SystemArchitecture.list('-version_number', 20);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, doc: current });
    }

    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.SystemArchitecture.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes, overall_score: r.overall_score
      }))});
    }

    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.SystemArchitecture.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.SystemArchitecture.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, doc: restored });
    }

    if (action === 'save') {
      const { content_html, arch_data, mermaid_syntax } = body;
      const all = await base44.asServiceRole.entities.SystemArchitecture.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0];
      if (current) {
        await base44.asServiceRole.entities.SystemArchitecture.update(current.id, {
          content_html, arch_data, mermaid_syntax, generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      const created = await base44.asServiceRole.entities.SystemArchitecture.create({
        version_number: 1, title: "The Write Vibe System Architecture",
        content_html, arch_data, mermaid_syntax,
        generated_at: new Date().toISOString(), is_current: true
      });
      return Response.json({ success: true, id: created.id });
    }

    if (action === 'generate') {
      const scores = calcScores();
      const totalItems = scores.totalItems;
      const categorySummary = FOUNDATION_CATEGORIES.map(cat =>
        `${cat.name} (${cat.items.length} items: ${cat.items.map(i=>`${i.name}[${i.status}]`).join(', ')})`
      ).join('\n');

      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a senior platform architect and investor relations expert writing the official System Architecture document for The Write Vibe — an AI-powered self-publishing platform preparing for Series A funding.

Platform overview: ${totalItems} foundational elements across 6 Site Foundation Standard categories, ${AGENTS.length}+ AI agents, 8 brand pillars, overall completion: ${scores.overall}%.

Categories and items:
${categorySummary}

Generate:
1. executive_summary: 4-5 sentence overview of the platform's architectural depth, AI-native design, and investor readiness
2. categories: array of 6 objects, one per category, each with:
   - id (matching: brand_identity, platform_architecture, ai_operations, strategic_reporting, product_platform, legal_compliance)
   - investor_significance: 2-3 sentences on why this category matters to a Series A investor
3. priority_roadmap: array of 5-7 specific action items to achieve 100% completion, ordered by priority

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  investor_significance: { type: "string" }
                }
              }
            },
            priority_roadmap: { type: "array", items: { type: "string" } }
          }
        }
      });

      const mermaid_syntax = buildMermaid(scores);
      const content_html = buildArchHTML(analysis, scores);

      const allVersions = await base44.asServiceRole.entities.SystemArchitecture.list('-version_number', 50);
      const latestVersion = allVersions[0]?.version_number || 0;
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.SystemArchitecture.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.SystemArchitecture.create({
        version_number: latestVersion + 1,
        title: "The Write Vibe System Architecture",
        content_html,
        mermaid_syntax,
        arch_data: { categories: FOUNDATION_CATEGORIES, overall_score: scores.overall, priority_roadmap: analysis.priority_roadmap },
        overall_score: scores.overall,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Generated ${new Date().toLocaleDateString()} · ${scores.overall}% complete · ${FOUNDATION_CATEGORIES.length} SFS categories`
      });

      return Response.json({ success: true, doc: saved });
    }

    if (action === 'regenerate_section') {
      const { category_id } = body;
      const cat = FOUNDATION_CATEGORIES.find(c => c.id === category_id);
      if (!cat) return Response.json({ error: 'Category not found' }, { status: 404 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an investor relations expert for The Write Vibe. Rewrite the investor significance analysis for the "${cat.name}" category of the System Architecture document.\n\nCategory purpose: ${cat.strategic_purpose}\nItems: ${cat.items.map(i=>i.name).join(', ')}\n\nReturn JSON: { investor_significance: "3-4 compelling sentences for a Series A investor" }`,
        response_json_schema: { type: "object", properties: { investor_significance: { type: "string" } } }
      });

      return Response.json({ success: true, category_id, data: result });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});