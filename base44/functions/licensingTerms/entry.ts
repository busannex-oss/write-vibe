import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  description: "An AI-powered self-publishing platform enabling independent authors to write, design, publish, and market books using artificial intelligence.",
  jurisdiction: "United States (Delaware incorporation)",
  core_platform: [
    "Proprietary AI orchestration engine for book production workflows",
    "AI manuscript writing, editing, and structural analysis tools",
    "AI-generated cover design system",
    "AI-powered audiobook production pipeline",
    "AI marketing, SEO, and campaign generation suite",
    "Amazon KDP and ACX distribution integration layer",
    "Author collaboration and team management system",
    "Book website builder and digital storefront",
    "Subscription billing and membership management infrastructure",
    "Agent memory and brand sentinel AI systems",
    "Platform analytics and reporting dashboard"
  ],
  licensee_permitted: [
    "Custom branding, logo, and color scheme (white-label skin)",
    "Proprietary niche vertical content (e.g., legal authors, medical professionals, faith-based publishing)",
    "Custom pricing tiers within licensor-approved ranges",
    "Licensee-owned author relationships and support infrastructure",
    "Territory-specific marketing and outreach campaigns",
    "Additional integrations via approved API connections"
  ],
  territory_model: "Geographic and niche-vertical exclusivity zones granted per licensing agreement; default is non-exclusive global territory",
  revenue_model: [
    "Monthly or annual licensing fee based on active author seats",
    "Revenue share: 12-18% of gross subscription revenue generated through licensed platform",
    "Setup fee for white-label configuration and onboarding",
    "Per-seat overage fees for authors exceeding contracted tier limits",
    "Renewal terms: annual with 90-day notice for non-renewal"
  ],
  pillars: [
    "Authentic Voice — preserving author originality and creative vision",
    "Professional Quality — publishing-industry-grade output standards",
    "Accessible Empowerment — democratizing professional publishing tools",
    "Ethical AI — transparent, author-serving AI with IP protections",
    "Community & Legacy — supporting author careers and literary legacy",
    "Innovation Leadership — continuous platform evolution and feature delivery",
    "Sustainable Business — fair revenue models for authors and licensees",
    "Brand Integrity — consistent platform standards across all licensed deployments"
  ],
  ip_framework: {
    licensor_owns: [
      "All source code, algorithms, and AI models",
      "Platform architecture, database schemas, and infrastructure",
      "The Write Vibe brand, trademarks, and trade dress",
      "Core workflow logic and production pipeline designs",
      "Platform analytics systems and benchmark data",
      "All AI training data and model weights"
    ],
    licensee_owns: [
      "Licensee's brand identity and white-label customizations",
      "Licensee's customer relationships and contact data",
      "Licensee-created marketing materials and proprietary content",
      "Territory-specific operational procedures and SOPs"
    ],
    author_owns: [
      "All manuscripts, books, and creative content authored on the platform",
      "Author's personal brand, name, and likeness",
      "Author's royalty rights and publishing agreements with third parties",
      "Author's pre-existing intellectual property brought to the platform"
    ]
  },
  reporting_requirements: [
    "Monthly active author seat counts submitted by 5th business day of following month",
    "Quarterly gross revenue reports with subscription breakdown by tier",
    "Annual brand compliance audit confirming pillar alignment standards",
    "Immediate notification of any data breach or security incident",
    "Semi-annual business review meeting with licensor representative"
  ],
  performance_standards: [
    "Maintain minimum Net Promoter Score (NPS) of 40 among licensed author base",
    "Platform uptime SLA of 99.5% monthly (excluding scheduled maintenance)",
    "Author onboarding completion rate minimum 70% within 30 days",
    "All AI-generated outputs must be reviewed per platform editorial standards",
    "Brand Pillar Alignment Score minimum 75/100 on annual compliance audit",
    "Zero tolerance for use of platform to generate prohibited content categories"
  ],
  termination_triggers: [
    "Material breach of IP ownership provisions",
    "Failure to pay licensing fees within 30 days of due date",
    "Pillar alignment score falling below 60/100 for two consecutive audits",
    "Unauthorized sublicensing or transfer of platform access",
    "Insolvency, bankruptcy, or cessation of operations",
    "Breach of author data protection obligations"
  ],
  contact_email: "licensing@thewritevibe.com",
  legal_email: "legal@thewritevibe.com"
};

const LICENSING_SECTIONS = [
  "Definitions and Interpretation",
  "Grant of License",
  "What Is Licensed — Platform Core and Tools",
  "What Remains Proprietary — Licensor Reserved Rights",
  "Territory and Exclusivity Terms",
  "Permitted Platform Customizations",
  "IP Ownership Framework — Platform Core vs. Licensee Additions",
  "Author Data Ownership and Access Rights",
  "Financial Obligations — Licensing Fees and Revenue Share",
  "Revenue Reporting and Audit Rights",
  "Performance Standards and Pillar Alignment Requirements",
  "Brand Standards and White-Label Compliance",
  "Reporting Requirements",
  "Sublicensing and Assignment Restrictions",
  "Confidentiality and Non-Disclosure",
  "Term and Renewal",
  "Termination Conditions and Consequences",
  "Dispute Resolution and Governing Law",
  "Representations and Warranties",
  "Limitation of Liability",
  "Indemnification",
  "Miscellaneous Provisions"
];

function buildDocHTML(content, effectiveDate, versionNumber) {
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:920px;margin:0 auto;color:#1e293b;line-height:1.8;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a,#1a2744);padding:52px 44px 44px;margin-bottom:0;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 14px;font-family:system-ui,sans-serif;">The Write Vibe · Licensing Document · Strictly Confidential</p>
    <h1 style="font-size:34px;font-weight:800;color:#ffffff;margin:0 0 6px;font-family:system-ui,sans-serif;letter-spacing:-1px;">Platform Licensing Terms &amp; Boundaries</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px;font-family:system-ui,sans-serif;">Agreement Framework for Agents &amp; Platform Licensees</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 24px;font-family:system-ui,sans-serif;">The Write Vibe — AI-Powered Self-Publishing Platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 24px;font-family:system-ui,sans-serif;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Document Version</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Effective Date</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">${effectiveDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Governing Law</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">State of Delaware, USA</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;">Document Type</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">Licensing Framework</p></div>
    </div>
  </div>

  <div style="background:#fefce8;border:1px solid #fde68a;padding:18px 28px;font-family:system-ui,sans-serif;">
    <p style="color:#92400e;font-size:12px;margin:0;line-height:1.7;"><strong>⚠️ Legal Review Required:</strong> This Licensing Terms &amp; Boundaries document was generated by AI as a professional framework for The Write Vibe platform licensing program. It is intended as a comprehensive starting point and <strong>must be reviewed, customized, and approved by a licensed attorney</strong> before execution with any licensee or agent. Licensing terms vary by territory, niche vertical, and specific deal structure. This document does not constitute a binding agreement until executed by authorized signatories of both parties.</p>
  </div>

  <div style="padding:44px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 44px;font-family:system-ui,sans-serif;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. Proprietary &amp; Confidential.</p>
    <p style="color:#cbd5e1;font-size:11px;margin:6px 0 0;">Licensing Terms &amp; Boundaries v${versionNumber} · Effective ${effectiveDate} · licensing@thewritevibe.com</p>
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
    const DOC_TYPE = 'licensing_terms';

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
        effective_date: d.effective_date, is_current: d.is_current, generation_notes: d.generation_notes
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
      const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const contextBlock = `
PLATFORM BEING LICENSED: ${PLATFORM_CONTEXT.name}
Description: ${PLATFORM_CONTEXT.description}
Jurisdiction: ${PLATFORM_CONTEXT.jurisdiction}

CORE PLATFORM COMPONENTS (Licensor IP):
${PLATFORM_CONTEXT.core_platform.map(c => `- ${c}`).join('\n')}

LICENSEE-PERMITTED CUSTOMIZATIONS:
${PLATFORM_CONTEXT.licensee_permitted.map(c => `- ${c}`).join('\n')}

TERRITORY MODEL: ${PLATFORM_CONTEXT.territory_model}

REVENUE & FINANCIAL MODEL:
${PLATFORM_CONTEXT.revenue_model.map(r => `- ${r}`).join('\n')}

BRAND PILLARS (Performance Standards):
${PLATFORM_CONTEXT.pillars.map(p => `- ${p}`).join('\n')}

IP OWNERSHIP FRAMEWORK:
Licensor Owns: ${PLATFORM_CONTEXT.ip_framework.licensor_owns.join('; ')}
Licensee Owns: ${PLATFORM_CONTEXT.ip_framework.licensee_owns.join('; ')}
Authors Own: ${PLATFORM_CONTEXT.ip_framework.author_owns.join('; ')}

PERFORMANCE STANDARDS:
${PLATFORM_CONTEXT.performance_standards.map(s => `- ${s}`).join('\n')}

REPORTING REQUIREMENTS:
${PLATFORM_CONTEXT.reporting_requirements.map(r => `- ${r}`).join('\n')}

TERMINATION TRIGGERS:
${PLATFORM_CONTEXT.termination_triggers.map(t => `- ${t}`).join('\n')}

CONTACT: ${PLATFORM_CONTEXT.contact_email}`;

      const prompt = `You are senior IP and licensing counsel at a top-tier law firm. Draft a comprehensive, professionally formatted Platform Licensing Terms & Boundaries Agreement for The Write Vibe — an AI-powered self-publishing platform — to be used with agents and white-label platform licensees.

PLATFORM CONTEXT:
${contextBlock}

Draft all ${LICENSING_SECTIONS.length} sections of this licensing agreement:
${LICENSING_SECTIONS.map((s, i) => `${i+1}. ${s}`).join('\n')}

Requirements:
- Professional, enforceable legal prose appropriate for a Series A-stage SaaS licensing agreement
- Clear demarcation between what is licensed vs. what remains proprietary
- Specific financial terms with placeholder brackets for negotiable figures (e.g., [LICENSEE_NAME], [TERRITORY], [MONTHLY_FEE])
- Pillar alignment requirements stated as measurable performance standards
- Author data sovereignty provisions that protect authors regardless of licensee relationship
- Delaware governing law with AAA arbitration clause
- Investor-grade language demonstrating defensible IP position

Return JSON: { "sections": [ { "title": "section title", "content": "full HTML using <p>, <ul>, <li>, <h3>, <strong> tags, NO inline styles, professional legal prose with defined terms in bold" } ] }`;

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

      const innerHtml = (result.sections || []).map((sec, idx) => `
<div style="margin-bottom:40px;">
  <h2 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid #f59e0b;font-family:system-ui,sans-serif;letter-spacing:-0.3px;">Section ${idx+1}. ${sec.title}</h2>
  <div style="color:#374151;font-size:14px;line-height:1.9;">${sec.content}</div>
</div>`).join('');

      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      const latestVersion = sameType[0]?.version_number || 0;
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: false })));

      const content_html = buildDocHTML(innerHtml, effectiveDate, latestVersion + 1);

      const saved = await base44.asServiceRole.entities.LegalDocument.create({
        doc_type: DOC_TYPE,
        version_number: latestVersion + 1,
        title: 'The Write Vibe — Platform Licensing Terms & Boundaries',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · ${LICENSING_SECTIONS.length} clauses · Effective ${effectiveDate}`
      });

      return Response.json({ success: true, doc: saved });
    }

    // ── REGENERATE SECTION ────────────────────────────────────────────────────
    if (action === 'regenerate_section') {
      const { section_name } = body;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are senior licensing counsel. Rewrite the "${section_name}" section of a Platform Licensing Terms & Boundaries Agreement for The Write Vibe (AI-powered self-publishing SaaS platform, Delaware jurisdiction). Use professional legal prose with defined terms in bold. Return JSON: { "content": "HTML using <p>, <ul>, <li>, <strong> tags, no inline styles" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });
      return Response.json({ success: true, section: section_name, content: result.content });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});