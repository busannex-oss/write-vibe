import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  description: "An AI-powered self-publishing platform that helps independent authors write, design, publish, and market books using artificial intelligence.",
  jurisdiction: "United States (Delaware incorporation), with services provided globally",
  services: [
    "AI-assisted manuscript writing and editing",
    "AI-generated book cover design",
    "AI-generated audiobook production",
    "AI-powered marketing and SEO content generation",
    "Amazon KDP and ACX publishing integration",
    "Team collaboration tools for co-authors and editors",
    "Book website builder",
    "Project management and reporting tools",
    "White-label licensing for enterprise clients"
  ],
  data_collected: [
    "Account information (full name, email address, profile photo)",
    "Book content, manuscripts, and intellectual property created on the platform",
    "Payment and billing information (processed via Stripe)",
    "Usage analytics and platform interaction data",
    "Team member and collaborator data",
    "AI generation prompts and output history",
    "Author biography and publication preferences",
    "Marketing content and promotional materials"
  ],
  payment_processing: "Stripe payment processing for subscription billing (Starter, Professional, Enterprise, White Label plans) with monthly and annual billing cycles",
  distribution_platforms: ["Amazon KDP (Kindle Direct Publishing)", "Amazon ACX (Audiobook Creation Exchange)", "Author-owned book websites"],
  subscription_tiers: ["Starter", "Professional", "Enterprise", "White Label"],
  ai_tools: ["Book outline generation", "Manuscript writing assistance", "Character creation", "Cover design generation", "Audiobook production", "Marketing copy generation", "SEO content creation", "Video commercial production"],
  contact_email: "legal@thewritevibe.com",
  privacy_email: "privacy@thewritevibe.com"
};

const PRIVACY_SECTIONS = [
  "Introduction and Scope", "Information We Collect", "How We Use Your Information",
  "Author Intellectual Property and Content Data", "AI Processing of Author Content",
  "Third-Party Distribution Platform Data Sharing", "Payment Processing",
  "Data Retention", "Data Security", "Your Rights (GDPR/CCPA)", "Children's Privacy",
  "International Data Transfers", "Cookies and Tracking", "Changes to This Policy", "Contact Information"
];

const TERMS_SECTIONS = [
  "Acceptance of Terms", "Description of Service", "Account Registration",
  "Author Content Ownership and IP Rights", "AI Tool Usage Terms and Limitations",
  "Platform License Grant", "Subscription Plans and Pricing", "Payment and Billing Terms",
  "Royalties and Distribution Terms", "Amazon KDP and ACX Integration Terms",
  "White Label Licensing Terms", "Prohibited Uses", "Intellectual Property of Platform",
  "Disclaimer of Warranties", "Limitation of Liability", "Indemnification",
  "Termination", "Governing Law and Dispute Resolution", "Changes to Terms", "Contact Information"
];

function buildDocHTML(type, content, effectiveDate, versionNumber) {
  const isPrivacy = type === 'privacy_policy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const subtitle = isPrivacy
    ? 'How The Write Vibe collects, uses, and protects your data'
    : 'The terms governing your use of The Write Vibe platform';

  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:900px;margin:0 auto;color:#1e293b;line-height:1.8;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:48px 40px;border-radius:0 0 0 0;margin-bottom:0;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-family:system-ui,sans-serif;">The Write Vibe · Legal Document · Confidential</p>
    <h1 style="font-size:36px;font-weight:800;color:#ffffff;margin:0 0 8px;font-family:system-ui,sans-serif;letter-spacing:-1px;">${title}</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;font-family:system-ui,sans-serif;">${subtitle}</p>
    <div style="display:inline-flex;gap:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 20px;font-family:system-ui,sans-serif;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Version</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.08);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Effective Date</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">${effectiveDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.08);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Jurisdiction</p><p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0;">United States</p></div>
    </div>
  </div>

  <div style="background:#fefce8;border:1px solid #fde68a;padding:16px 24px;font-family:system-ui,sans-serif;">
    <p style="color:#92400e;font-size:12px;margin:0;"><strong>⚠️ Legal Review Recommended:</strong> This document was generated by AI for The Write Vibe platform. It is intended as a professional starting point and should be reviewed and approved by a licensed attorney before publication or enforcement. Laws vary by jurisdiction and may change.</p>
  </div>

  <div style="padding:40px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 40px;font-family:system-ui,sans-serif;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. · ${title} v${versionNumber} · Effective ${effectiveDate}</p>
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
    const docType = body.doc_type || 'privacy_policy';

    // ── GET CURRENT ──────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 20);
      const pp = all.find(d => d.doc_type === 'privacy_policy' && d.is_current) || all.find(d => d.doc_type === 'privacy_policy') || null;
      const tos = all.find(d => d.doc_type === 'terms_of_service' && d.is_current) || all.find(d => d.doc_type === 'terms_of_service') || null;
      return Response.json({ success: true, privacy_policy: pp, terms_of_service: tos });
    }

    // ── VERSIONS ─────────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const filtered = all.filter(d => d.doc_type === docType);
      return Response.json({ success: true, versions: filtered.map(d => ({
        id: d.id, version_number: d.version_number, generated_at: d.generated_at,
        effective_date: d.effective_date, is_current: d.is_current, generation_notes: d.generation_notes
      }))});
    }

    // ── RESTORE ──────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === docType);
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: d.id === id })));
      const restored = sameType.find(d => d.id === id);
      return Response.json({ success: true, doc: restored });
    }

    // ── SAVE ─────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 20);
      const current = all.find(d => d.doc_type === docType && d.is_current) || all.find(d => d.doc_type === docType);
      if (current) {
        await base44.asServiceRole.entities.LegalDocument.update(current.id, { content_html, generated_at: new Date().toISOString() });
        return Response.json({ success: true, id: current.id });
      }
      return Response.json({ error: 'No document to save' }, { status: 404 });
    }

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const isPrivacy = docType === 'privacy_policy';
      const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
      const docTitle = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
      const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const platformDesc = `Platform: ${PLATFORM_CONTEXT.name}. ${PLATFORM_CONTEXT.description}. Jurisdiction: ${PLATFORM_CONTEXT.jurisdiction}. Services: ${PLATFORM_CONTEXT.services.join('; ')}. Data collected: ${PLATFORM_CONTEXT.data_collected.join('; ')}. Payment: ${PLATFORM_CONTEXT.payment_processing}. Distribution: ${PLATFORM_CONTEXT.distribution_platforms.join(', ')}. Plans: ${PLATFORM_CONTEXT.subscription_tiers.join(', ')}. AI tools: ${PLATFORM_CONTEXT.ai_tools.join(', ')}.`;

      const keyReqs = isPrivacy
        ? 'GDPR and CCPA compliant. Provisions for AI processing of author manuscripts and IP. Disclosure of data sharing with Amazon KDP/ACX. Author content ownership protections. Stripe payment data disclosures. White-label operator provisions.'
        : 'Strong author IP ownership and content rights. AI-assisted content usage terms and limitations. Amazon KDP/ACX integration and royalty handling. Stripe payment and subscription billing. White-label licensing. Limitation of liability for AI-generated content. Class action waiver and arbitration clause. DMCA compliance.';

      // Split sections into two batches for parallel generation
      const midpoint = Math.ceil(sections.length / 2);
      const batch1 = sections.slice(0, midpoint);
      const batch2 = sections.slice(midpoint);

      const sectionSchema = {
        type: "object",
        properties: {
          sections: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } }
        }
      };

      const makeBatchPrompt = (batch, batchIndex) =>
        `You are senior legal counsel drafting part of a ${docTitle} for an AI-powered self-publishing platform.

${platformDesc}

Key requirements: ${keyReqs}

Draft ONLY these sections (${batchIndex === 0 ? 'first' : 'second'} half):
${batch.map((s, i) => `${(batchIndex === 0 ? 0 : midpoint) + i + 1}. ${s}`).join('\n')}

Return JSON: { "sections": [ { "title": "section title", "content": "HTML using <p><ul><li><h3> only, no inline styles, professional legal prose" } ] }`;

      // Run both batches + risk analysis in parallel
      const [batch1Result, batch2Result, riskAnalysis] = await Promise.all([
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: makeBatchPrompt(batch1, 0),
          response_json_schema: sectionSchema
        }),
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: makeBatchPrompt(batch2, 1),
          response_json_schema: sectionSchema
        }),
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a legal risk analyst. Identify 4-6 legal risk areas in the ${docTitle} for The Write Vibe (AI self-publishing platform handling author IP, AI-generated content, Amazon KDP/ACX distribution). For each risk: section, risk_level (high/medium/low), description (1-2 sentences), recommendation (1-2 sentences). Also: overall_risk, summary (2-3 sentences). Return JSON.`,
          response_json_schema: {
            type: "object",
            properties: {
              overall_risk: { type: "string" },
              summary: { type: "string" },
              risks: { type: "array", items: { type: "object", properties: { section: { type: "string" }, risk_level: { type: "string" }, description: { type: "string" }, recommendation: { type: "string" } } } }
            }
          }
        })
      ]);

      const allSections = [...(batch1Result.sections || []), ...(batch2Result.sections || [])];

      // Build inner content HTML from sections
      const innerHtml = allSections.map((sec, idx) => `
<div style="margin-bottom:36px;">
  <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f59e0b;font-family:system-ui,sans-serif;">${idx+1}. ${sec.title}</h2>
  <div style="color:#374151;font-size:14px;line-height:1.85;">${sec.content}</div>
</div>`).join('');

      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === docType);
      const latestVersion = sameType[0]?.version_number || 0;
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: false })));

      const content_html = buildDocHTML(docType, innerHtml, effectiveDate, latestVersion + 1);

      const saved = await base44.asServiceRole.entities.LegalDocument.create({
        doc_type: docType,
        version_number: latestVersion + 1,
        title: `The Write Vibe ${docTitle}`,
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        risk_analysis: riskAnalysis,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · Effective ${effectiveDate}`
      });

      return Response.json({ success: true, doc: saved });
    }

    // ── REGENERATE SECTION ────────────────────────────────────────────────────
    if (action === 'regenerate_section') {
      const { section_name, doc_type: dt } = body;
      const isPrivacy = (dt || docType) === 'privacy_policy';
      const platformDesc = `Platform: ${PLATFORM_CONTEXT.name}. Services: ${PLATFORM_CONTEXT.services.slice(0,4).join(', ')}. Jurisdiction: ${PLATFORM_CONTEXT.jurisdiction}.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are senior legal counsel for The Write Vibe (AI-powered self-publishing platform). ${platformDesc}

Rewrite the "${section_name}" section of the ${isPrivacy ? 'Privacy Policy' : 'Terms of Service'} as professional legal prose. Return JSON: { "content": "full HTML using <p>, <ul>, <li> tags only, no inline styles" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });

      return Response.json({ success: true, section: section_name, content: result.content });
    }

    // ── REGENERATE RISK ANALYSIS ──────────────────────────────────────────────
    if (action === 'regenerate_risk') {
      const isPrivacy = docType === 'privacy_policy';
      const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a legal risk analyst. Identify 4-6 legal risk areas in the ${isPrivacy ? 'Privacy Policy' : 'Terms of Service'} for The Write Vibe (AI self-publishing platform handling author IP and AI content). Return JSON with: overall_risk, summary, risks array (section, risk_level, description, recommendation).`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk: { type: "string" },
            summary: { type: "string" },
            risks: { type: "array", items: { type: "object", properties: { section: { type: "string" }, risk_level: { type: "string" }, description: { type: "string" }, recommendation: { type: "string" } } } }
          }
        }
      });

      // Save risk analysis to current doc
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 20);
      const current = all.find(d => d.doc_type === docType && d.is_current) || all.find(d => d.doc_type === docType);
      if (current) {
        await base44.asServiceRole.entities.LegalDocument.update(current.id, { risk_analysis: result });
      }

      return Response.json({ success: true, risk_analysis: result });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});