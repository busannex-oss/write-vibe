import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Complete platform page inventory ──────────────────────────────────────────
const PLATFORM_PAGES = {
  public: [
    { name: "Landing", path: "/", type: "Marketing", purpose: "Primary acquisition page — hero, value props, CTAs, social proof", pillars: ["Creativity", "Innovation", "Empowerment"], strategic_role: "Top-of-funnel conversion driver; first impression for investors and authors" },
    { name: "Pricing", path: "/Pricing", type: "Commercial", purpose: "Tiered subscription plans: Starter, Professional, Enterprise, White Label", pillars: ["Growth", "Excellence"], strategic_role: "Revenue conversion page; demonstrates monetization strategy to investors" },
    { name: "How It Works", path: "/HowItWorks", type: "Educational", purpose: "Step-by-step walkthrough of the AI-powered authoring workflow", pillars: ["Innovation", "Empowerment"], strategic_role: "Reduces friction in conversion funnel; educates potential authors" },
    { name: "About", path: "/About", type: "Brand", purpose: "Company story, mission, team, and founding vision", pillars: ["Authenticity", "Integrity"], strategic_role: "Trust-building for investors, agents, and authors" },
    { name: "Investor", path: "/Investor", type: "Investor Relations", purpose: "Dedicated investor deck, metrics, market opportunity, and contact", pillars: ["Growth", "Excellence", "Integrity"], strategic_role: "Primary investor acquisition page; Series A readiness signal" },
    { name: "Contact", path: "/Contact", type: "Support", purpose: "Multi-channel contact form for authors, press, and partnership inquiries", pillars: ["Community", "Authenticity"], strategic_role: "Relationship intake hub for enterprise and partnership leads" },
    { name: "FAQ", path: "/FAQ", type: "Support", purpose: "Frequently asked questions about features, pricing, and publishing", pillars: ["Empowerment", "Integrity"], strategic_role: "Reduces support burden; improves conversion by resolving objections" },
    { name: "Book Website", path: "/BookWebsite", type: "Author Marketing", purpose: "Public-facing book landing page for individual book promotion", pillars: ["Creativity", "Community"], strategic_role: "Author revenue driver; demonstrates platform depth to publishers" }
  ],
  dashboard: [
    { name: "Dashboard", path: "/Dashboard", type: "Core Platform", purpose: "Central command hub — book stats, project overview, quick actions", pillars: ["Excellence", "Empowerment"], strategic_role: "Primary author workspace; retention anchor page" },
    { name: "Books", path: "/Books", type: "Core Platform", purpose: "Book library — all projects, status tracking, creation entry point", pillars: ["Creativity", "Growth"], strategic_role: "Portfolio view demonstrating platform productivity" },
    { name: "Book Editor", path: "/BookEditor", type: "Core Platform", purpose: "Full-featured AI book studio — outline, write, design, publish, market", pillars: ["Creativity", "Innovation", "Excellence"], strategic_role: "Core product experience; highest-value feature set" },
    { name: "Create Book", path: "/CreateBook", type: "Core Platform", purpose: "New book wizard — genre, audience, premise, initial AI generation", pillars: ["Creativity", "Innovation"], strategic_role: "Onboarding entry point for new projects" },
    { name: "Documents", path: "/Documents", type: "Core Platform", purpose: "Document library — press releases, publisher letters, white papers", pillars: ["Excellence", "Empowerment"], strategic_role: "Business document hub for publishing professionals" },
    { name: "Team", path: "/Team", type: "Collaboration", purpose: "Team management — invite co-authors, editors, marketers with role-based access", pillars: ["Community", "Empowerment"], strategic_role: "Collaboration layer enabling professional publishing teams" },
    { name: "Settings", path: "/Settings", type: "Configuration", purpose: "Profile, billing, white-label config, notification preferences", pillars: ["Integrity", "Excellence"], strategic_role: "Account management and white-label customization hub" },
    { name: "Project Reports", path: "/ProjectReports", type: "Analytics", purpose: "AI-generated project status reports, timelines, and milestone tracking", pillars: ["Excellence", "Growth"], strategic_role: "Demonstrates platform ROI to authors and enterprise clients" }
  ],
  foundation: [
    { name: "Mission Statement", path: "/MissionStatement", type: "Brand Foundation", purpose: "Live mission document with AI-generated versions, pillar scoring, and version control", pillars: ["Authenticity", "Integrity", "Growth"], strategic_role: "Foundation document for investor narrative and brand alignment" },
    { name: "SOPs", path: "/SOPs", type: "Operations", purpose: "Standard Operating Procedures library — categorized, versioned, pillar-aligned", pillars: ["Excellence", "Integrity", "Empowerment"], strategic_role: "Operational maturity signal; demonstrates scalable process infrastructure" },
    { name: "Master Registry", path: "/MasterRegistry", type: "Architecture", purpose: "Complete inventory of all 17 platform elements — status, purpose, dependencies", pillars: ["Excellence", "Innovation", "Integrity"], strategic_role: "Architectural transparency document for technical due diligence" },
    { name: "Map Legend", path: "/MapLegend", type: "Architecture", purpose: "Visual legend for platform architecture maps — element types, relationships, hierarchy", pillars: ["Innovation", "Excellence"], strategic_role: "Navigation aid for complex platform diagrams in investor materials" },
    { name: "Pillar Alignment", path: "/PillarAlignment", type: "Strategy", purpose: "8-pillar alignment scorecard — per-pillar analysis, gaps, roadmap, investor insights", pillars: ["Authenticity", "Integrity", "Growth", "Excellence"], strategic_role: "Investor-facing strategic health report; demonstrates brand coherence" },
    { name: "Brand Style Guide", path: "/BrandStyleGuide", type: "Brand Foundation", purpose: "Complete brand identity doc — colors, typography, voice, positioning, applications", pillars: ["Authenticity", "Creativity", "Excellence"], strategic_role: "Brand identity anchor for investors, agents, and white-label partners" },
    { name: "Sitemap", path: "/Sitemap", type: "Architecture", purpose: "Full platform sitemap — visual hierarchy, page inventory, pillar alignment per page", pillars: ["Innovation", "Excellence", "Integrity"], strategic_role: "Platform scope document for investors and technical partners" },
    { name: "Agent Memory Log", path: "/AgentMemoryLog", type: "AI Operations", purpose: "AI agent memory ledger — decisions, observations, optimizations logged per session", pillars: ["Innovation", "Integrity"], strategic_role: "AI transparency and auditability layer for enterprise clients" },
    { name: "User Management", path: "/UserManagement", type: "Administration", purpose: "Admin panel — user accounts, roles, subscription tiers, invite management", pillars: ["Excellence", "Community"], strategic_role: "Platform governance and membership management" },
    { name: "Error Dashboard", path: "/ErrorDashboard", type: "Operations", purpose: "Runtime error log — categorized by severity, component, resolution status", pillars: ["Excellence", "Integrity"], strategic_role: "Platform reliability monitoring; demonstrates operational maturity" }
  ],
  legal: [
    { name: "Privacy Policy", path: "/Privacy", type: "Legal", purpose: "Data collection, storage, and usage disclosures per GDPR/CCPA", pillars: ["Integrity"], strategic_role: "Compliance and trust signal for enterprise and international clients" },
    { name: "Terms of Service", path: "/Terms", type: "Legal", purpose: "Platform usage terms, IP ownership, subscription conditions", pillars: ["Integrity"], strategic_role: "Legal protection and professional credibility" },
    { name: "Cookie Policy", path: "/CookiePolicy", type: "Legal", purpose: "Cookie usage disclosure and opt-out mechanisms", pillars: ["Integrity"], strategic_role: "GDPR compliance for EU market expansion" }
  ]
};

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];

// ── HTML builder ──────────────────────────────────────────────────────────────
function buildSitemapHTML(analysis, sitemapData) {
  const pageTypeColors = {
    "Marketing": "#3b82f6", "Commercial": "#10b981", "Educational": "#8b5cf6",
    "Brand": "#f59e0b", "Investor Relations": "#fbbf24", "Support": "#6366f1",
    "Author Marketing": "#ec4899", "Core Platform": "#f59e0b", "Collaboration": "#14b8a6",
    "Configuration": "#64748b", "Analytics": "#22c55e", "Brand Foundation": "#f97316",
    "Operations": "#ef4444", "Architecture": "#a78bfa", "Strategy": "#fbbf24",
    "AI Operations": "#06b6d4", "Administration": "#78716c", "Legal": "#94a3b8"
  };

  const pillarColors = {
    "Authenticity": "#f59e0b", "Creativity": "#a78bfa", "Empowerment": "#22c55e",
    "Innovation": "#06b6d4", "Community": "#ec4899", "Excellence": "#fbbf24",
    "Integrity": "#6366f1", "Growth": "#10b981"
  };

  const renderPageRows = (pages) => pages.map(p => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
      <td style="padding:12px 16px; color:#f1f5f9; font-size:13px; font-weight:500;">${p.name}</td>
      <td style="padding:12px 16px;">
        <span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; background:${pageTypeColors[p.type] || '#64748b'}20; color:${pageTypeColors[p.type] || '#94a3b8'}; border:1px solid ${pageTypeColors[p.type] || '#64748b'}30;">${p.type}</span>
      </td>
      <td style="padding:12px 16px; color:#94a3b8; font-size:12px; line-height:1.5;">${p.purpose}</td>
      <td style="padding:12px 16px;">
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          ${(p.pillars || []).map(pill => `<span style="display:inline-block; padding:1px 6px; border-radius:4px; font-size:10px; background:${pillarColors[pill] || '#64748b'}15; color:${pillarColors[pill] || '#94a3b8'}; border:1px solid ${pillarColors[pill] || '#64748b'}25;">${pill}</span>`).join('')}
        </div>
      </td>
      <td style="padding:12px 16px; color:#64748b; font-size:12px; line-height:1.5;">${p.strategic_role}</td>
    </tr>`).join('');

  const renderSection = (title, pages, color, number, icon, desc) => `
    <div style="margin-bottom:48px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
        <div style="width:36px; height:36px; border-radius:10px; background:${color}18; border:1px solid ${color}30; display:flex; align-items:center; justify-content:center; font-size:16px;">${icon}</div>
        <div>
          <h2 style="font-size:20px; font-weight:700; color:#ffffff; margin:0;">${number} · ${title}</h2>
          <p style="color:#64748b; font-size:12px; margin:4px 0 0;">${pages.length} pages · ${desc}</p>
        </div>
      </div>
      <div style="height:1px; background:rgba(255,255,255,0.06); margin:16px 0 20px;"></div>
      <div style="overflow-x:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
        <table style="width:100%; border-collapse:collapse; font-family:system-ui,sans-serif;">
          <thead>
            <tr style="background:rgba(255,255,255,0.03);">
              <th style="padding:10px 16px; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; white-space:nowrap;">Page</th>
              <th style="padding:10px 16px; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; white-space:nowrap;">Type</th>
              <th style="padding:10px 16px; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; width:30%;">Purpose</th>
              <th style="padding:10px 16px; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; white-space:nowrap;">Pillars</th>
              <th style="padding:10px 16px; text-align:left; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; width:25%;">Strategic Role</th>
            </tr>
          </thead>
          <tbody>${renderPageRows(pages)}</tbody>
        </table>
      </div>
    </div>`;

  const totalPages = PLATFORM_PAGES.public.length + PLATFORM_PAGES.dashboard.length + PLATFORM_PAGES.foundation.length + PLATFORM_PAGES.legal.length;

  const pillarCoverage = {};
  PILLARS.forEach(p => { pillarCoverage[p] = 0; });
  [...PLATFORM_PAGES.public, ...PLATFORM_PAGES.dashboard, ...PLATFORM_PAGES.foundation, ...PLATFORM_PAGES.legal].forEach(page => {
    (page.pillars || []).forEach(p => { if (pillarCoverage[p] !== undefined) pillarCoverage[p]++; });
  });

  const pillarBars = Object.entries(pillarCoverage).map(([p, count]) => {
    const pct = Math.round((count / totalPages) * 100);
    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#94a3b8; font-size:12px;">${p}</span>
          <span style="color:#64748b; font-size:11px; font-family:monospace;">${count} pages · ${pct}%</span>
        </div>
        <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:linear-gradient(90deg,#f59e0b,#ea580c); border-radius:3px;"></div>
        </div>
      </div>`;
  }).join('');

  return `<div style="font-family:system-ui,-apple-system,sans-serif; max-width:1000px; margin:0 auto; color:#e2e8f0; line-height:1.6;">

  <!-- COVER -->
  <div style="text-align:center; padding:48px 0 40px; border-bottom:2px solid rgba(245,158,11,0.3); margin-bottom:48px;">
    <p style="color:#f59e0b; font-size:11px; letter-spacing:4px; text-transform:uppercase; margin-bottom:12px;">Confidential · Platform Architecture Document</p>
    <h1 style="font-size:36px; font-weight:800; color:#ffffff; margin:0 0 8px; letter-spacing:-1px;">The Write Vibe</h1>
    <h2 style="font-size:20px; font-weight:400; color:#94a3b8; margin:0 0 20px;">Platform Sitemap & Page Inventory</h2>
    <div style="display:inline-flex; gap:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px 24px;">
      <div style="text-align:center;">
        <p style="color:#fbbf24; font-size:24px; font-weight:800; margin:0;">${totalPages}</p>
        <p style="color:#64748b; font-size:11px; margin:2px 0 0; text-transform:uppercase; letter-spacing:1px;">Total Pages</p>
      </div>
      <div style="width:1px; background:rgba(255,255,255,0.06);"></div>
      <div style="text-align:center;">
        <p style="color:#fbbf24; font-size:24px; font-weight:800; margin:0;">${PLATFORM_PAGES.public.length}</p>
        <p style="color:#64748b; font-size:11px; margin:2px 0 0; text-transform:uppercase; letter-spacing:1px;">Public Pages</p>
      </div>
      <div style="width:1px; background:rgba(255,255,255,0.06);"></div>
      <div style="text-align:center;">
        <p style="color:#fbbf24; font-size:24px; font-weight:800; margin:0;">${PLATFORM_PAGES.dashboard.length + PLATFORM_PAGES.foundation.length}</p>
        <p style="color:#64748b; font-size:11px; margin:2px 0 0; text-transform:uppercase; letter-spacing:1px;">Platform Pages</p>
      </div>
      <div style="width:1px; background:rgba(255,255,255,0.06);"></div>
      <div style="text-align:center;">
        <p style="color:#fbbf24; font-size:24px; font-weight:800; margin:0;">8</p>
        <p style="color:#64748b; font-size:11px; margin:2px 0 0; text-transform:uppercase; letter-spacing:1px;">Brand Pillars</p>
      </div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:16px; padding:28px; margin-bottom:48px;">
    <p style="color:#f59e0b; font-size:11px; letter-spacing:3px; text-transform:uppercase; margin:0 0 10px;">Executive Summary</p>
    <p style="color:#cbd5e1; font-size:15px; margin:0; line-height:1.8;">${analysis.executive_summary}</p>
  </div>

  <!-- PILLAR COVERAGE -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px; font-weight:700; color:#ffffff; margin:0 0 6px;">Pillar Coverage Across Platform</h2>
    <p style="color:#64748b; font-size:12px; margin:0 0 20px;">How deeply each brand pillar is embedded across all ${totalPages} platform pages</p>
    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:24px;">
      ${pillarBars}
    </div>
  </div>

  <!-- VISUAL HIERARCHY -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px; font-weight:700; color:#ffffff; margin:0 0 6px;">Platform Architecture Overview</h2>
    <p style="color:#64748b; font-size:12px; margin:0 0 20px;">High-level navigation hierarchy and access zones</p>
    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:28px; overflow-x:auto;">
      <div style="min-width:600px;">
        <!-- Root -->
        <div style="text-align:center; margin-bottom:24px;">
          <div style="display:inline-block; background:linear-gradient(135deg,#f59e0b,#ea580c); border-radius:12px; padding:10px 24px; color:#fff; font-weight:700; font-size:14px;">thewritevibe.com</div>
        </div>
        <!-- Connector -->
        <div style="display:flex; justify-content:center; gap:0; margin-bottom:0;">
          <div style="width:1px; height:20px; background:rgba(245,158,11,0.4);"></div>
        </div>
        <!-- Zone Branches -->
        <div style="display:flex; gap:12px; justify-content:center; margin-bottom:20px;">
          ${[
            { label: "Public Zone", color: "#3b82f6", count: PLATFORM_PAGES.public.length },
            { label: "Dashboard Zone", color: "#f59e0b", count: PLATFORM_PAGES.dashboard.length },
            { label: "Foundation Zone", color: "#a78bfa", count: PLATFORM_PAGES.foundation.length },
            { label: "Legal Zone", color: "#64748b", count: PLATFORM_PAGES.legal.length }
          ].map(z => `
            <div style="flex:1; max-width:200px; text-align:center;">
              <div style="height:20px; width:1px; background:${z.color}60; margin:0 auto 8px;"></div>
              <div style="background:${z.color}15; border:1px solid ${z.color}40; border-radius:10px; padding:10px 8px;">
                <p style="color:${z.color}; font-size:12px; font-weight:700; margin:0 0 2px;">${z.label}</p>
                <p style="color:#64748b; font-size:11px; margin:0;">${z.count} pages</p>
              </div>
            </div>`).join('')}
        </div>
        <!-- Page chips per zone -->
        <div style="display:flex; gap:12px; justify-content:center;">
          ${[
            { pages: PLATFORM_PAGES.public, color: "#3b82f6" },
            { pages: PLATFORM_PAGES.dashboard, color: "#f59e0b" },
            { pages: PLATFORM_PAGES.foundation, color: "#a78bfa" },
            { pages: PLATFORM_PAGES.legal, color: "#64748b" }
          ].map(z => `
            <div style="flex:1; max-width:200px; display:flex; flex-direction:column; gap:4px; align-items:center;">
              ${z.pages.slice(0,5).map(p => `<div style="width:100%; background:${z.color}08; border:1px solid ${z.color}20; border-radius:6px; padding:4px 8px; text-align:center;"><span style="color:${z.color}; font-size:10px; font-weight:500;">${p.name}</span></div>`).join('')}
              ${z.pages.length > 5 ? `<div style="color:#64748b; font-size:10px;">+${z.pages.length - 5} more</div>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE SECTIONS -->
  ${renderSection("Public-Facing Pages", PLATFORM_PAGES.public, "#3b82f6", "01", "🌐", "Accessible without login — marketing, acquisition, and conversion")}
  ${renderSection("Platform Dashboard Pages", PLATFORM_PAGES.dashboard, "#f59e0b", "02", "⚡", "Authenticated author workspace — core product experience")}
  ${renderSection("Site Foundation Standard Pages", PLATFORM_PAGES.foundation, "#a78bfa", "03", "🏛️", "17 Site Foundation Standard pages — brand, strategy, and architecture documents")}
  ${renderSection("Legal Pages", PLATFORM_PAGES.legal, "#64748b", "04", "⚖️", "Compliance, transparency, and legal protection")}

  <!-- AI ANALYSIS -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:20px; font-weight:700; color:#ffffff; margin:0 0 16px;">Strategic Analysis</h2>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:20px;">
        <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Architectural Strengths</p>
        <p style="color:#94a3b8; font-size:13px; margin:0; line-height:1.7;">${analysis.strengths}</p>
      </div>
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:20px;">
        <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Investor Narrative</p>
        <p style="color:#94a3b8; font-size:13px; margin:0; line-height:1.7;">${analysis.investor_narrative}</p>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center; padding:32px 0; border-top:1px solid rgba(255,255,255,0.06); margin-top:40px;">
    <p style="color:#334155; font-size:12px;">© ${new Date().getFullYear()} The Write Vibe · Platform Sitemap · Confidential · v${new Date().toLocaleDateString()}</p>
  </div>
</div>`;
}

function buildMermaidSyntax() {
  const lines = ['graph TD', '  ROOT["🌐 thewritevibe.com"]', ''];
  lines.push('  ROOT --> PUB["📢 Public Zone"]');
  lines.push('  ROOT --> DASH["⚡ Dashboard Zone"]');
  lines.push('  ROOT --> FOUND["🏛️ Foundation Zone"]');
  lines.push('  ROOT --> LEGAL["⚖️ Legal Zone"]');
  lines.push('');
  PLATFORM_PAGES.public.forEach(p => lines.push(`  PUB --> ${p.name.replace(/\s/g,'')}["${p.name}"]`));
  lines.push('');
  PLATFORM_PAGES.dashboard.forEach(p => lines.push(`  DASH --> ${p.name.replace(/\s/g,'')}["${p.name}"]`));
  lines.push('');
  PLATFORM_PAGES.foundation.forEach(p => lines.push(`  FOUND --> ${p.name.replace(/\s/g,'')}["${p.name}"]`));
  lines.push('');
  PLATFORM_PAGES.legal.forEach(p => lines.push(`  LEGAL --> ${p.name.replace(/\s/g,'')}["${p.name}"]`));
  return lines.join('\n');
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'get_current';

    // ── GET CURRENT ──────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.Sitemap.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, sitemap: current });
    }

    // ── GET VERSIONS ─────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.Sitemap.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes
      }))});
    }

    // ── RESTORE ──────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.Sitemap.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.Sitemap.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, sitemap: restored });
    }

    // ── SAVE ─────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html, sitemap_data, mermaid_syntax } = body;
      const all = await base44.asServiceRole.entities.Sitemap.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0];
      if (current) {
        await base44.asServiceRole.entities.Sitemap.update(current.id, {
          content_html, sitemap_data, mermaid_syntax, generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      const created = await base44.asServiceRole.entities.Sitemap.create({
        version_number: 1, title: "The Write Vibe Platform Sitemap",
        content_html, sitemap_data, mermaid_syntax,
        generated_at: new Date().toISOString(), is_current: true
      });
      return Response.json({ success: true, id: created.id });
    }

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const totalPages = PLATFORM_PAGES.public.length + PLATFORM_PAGES.dashboard.length + PLATFORM_PAGES.foundation.length + PLATFORM_PAGES.legal.length;
      const ctx = `The Write Vibe is an AI-powered self-publishing platform with ${totalPages} pages across 4 zones: ${PLATFORM_PAGES.public.length} public marketing/acquisition pages, ${PLATFORM_PAGES.dashboard.length} dashboard pages, ${PLATFORM_PAGES.foundation.length} Site Foundation Standard pages (mission, SOPs, brand architecture, pillar alignment, style guide, sitemap, agent memory), and ${PLATFORM_PAGES.legal.length} legal pages. Built for Series A funding. Target: independent authors and literary agents. 8 pillars: Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth.`;

      const analysisRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a platform architect writing investor documentation for The Write Vibe. Based on this platform overview:\n${ctx}\n\nReturn JSON with:\n- executive_summary: 3-4 sentence overview of the platform's architectural scope and strategic depth for investors\n- strengths: 2-3 sentences on architectural strengths visible in the sitemap\n- investor_narrative: 2-3 sentences on what this sitemap communicates to a Series A investor`,
        response_json_schema: { type: "object", properties: { executive_summary: {type:"string"}, strengths: {type:"string"}, investor_narrative: {type:"string"} } }
      });

      const sitemap_data = {
        public_pages: PLATFORM_PAGES.public,
        dashboard_pages: PLATFORM_PAGES.dashboard,
        foundation_pages: PLATFORM_PAGES.foundation,
        legal_pages: PLATFORM_PAGES.legal
      };
      const mermaid_syntax = buildMermaidSyntax();
      const content_html = buildSitemapHTML(analysisRes, sitemap_data);

      const allVersions = await base44.asServiceRole.entities.Sitemap.list('-version_number', 50);
      const latestVersion = allVersions[0]?.version_number || 0;
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.Sitemap.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.Sitemap.create({
        version_number: latestVersion + 1,
        title: "The Write Vibe Platform Sitemap",
        content_html, sitemap_data, mermaid_syntax,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Generated ${new Date().toLocaleDateString()} · ${totalPages} pages across 4 zones`
      });

      return Response.json({ success: true, sitemap: saved });
    }

    // ── REGENERATE SECTION ───────────────────────────────────────────────────
    if (action === 'regenerate_section') {
      const { section } = body;
      const pages = PLATFORM_PAGES[section] || [];
      const ctx = `The Write Vibe — AI self-publishing platform. Section: ${section}. Pages: ${pages.map(p=>p.name).join(', ')}`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a platform architect. Rewrite the strategic analysis for the "${section}" section of The Write Vibe platform sitemap. ${ctx}\n\nReturn JSON: { analysis: "3-4 sentences of strategic insight about this section for investors" }`,
        response_json_schema: { type: "object", properties: { analysis: {type:"string"} } }
      });

      return Response.json({ success: true, section, data: result });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});