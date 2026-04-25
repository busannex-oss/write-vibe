import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_CONTEXT = {
  name: "The Write Vibe",
  tagline: "AI-Powered Self-Publishing Platform for Independent Authors",
  core_offering: "An end-to-end AI book production studio that takes authors from blank page to published book — manuscript writing, cover design, audiobook production, marketing campaigns, Amazon KDP/ACX distribution, and book website — all in one platform.",
  publishing_workflow: [
    "1. Book Setup — title, genre, target audience, characters, plot summary",
    "2. Outline Generation — AI produces table of contents, detailed outline, industry-standard scene breakdown",
    "3. Manuscript Writing — AI-assisted chapter-by-chapter writing with voice preservation",
    "4. Cover Design — AI-generated front and back covers with voting and refinement",
    "5. Manuscript Formatting — platform-ready formatting for KDP and ACX submission",
    "6. Audiobook Production — AI voice narration with script review",
    "7. Marketing Suite — Amazon SEO metadata, social campaigns, press release, publisher letter",
    "8. Distribution — one-click KDP and ACX submission with validation dashboard",
    "9. Book Website — AI-generated author site with storefront links",
    "10. Analytics & Reviews — performance tracking and review management"
  ],
  target_author: {
    profile: "Independent authors aged 28–65 with a story to tell but limited time, technical skills, or publishing industry knowledge",
    motivations: ["First-time authors wanting professional results", "Experienced authors wanting to publish faster", "Entrepreneurs building authority through books", "Coaches and speakers creating signature books", "Retirees fulfilling lifelong writing dreams"],
    pain_points: ["Overwhelmed by the publishing process complexity", "Fear their writing isn't good enough", "Don't know how to market or distribute", "Limited budget for traditional publishing services", "Intimidated by Amazon KDP and ACX systems"]
  },
  ai_tools: [
    "Title Suggester Agent — generates commercially viable book titles",
    "Outline Generator Agent — creates industry-standard chapter structures",
    "Manuscript Writer — AI chapter writing with author voice matching",
    "Character Creator — deep character profiles with backstory and traits",
    "Cover Designer — AI image generation with style selection",
    "Audiobook Producer — AI voice narration and script management",
    "Marketing Campaign Generator — social posts, email sequences, ad copy",
    "SEO Metadata Editor — Amazon keyword and category optimization",
    "Book Summary Writer — compelling back-cover descriptions",
    "Brand Sentinel — brand consistency monitoring across all content",
    "Website Builder Agent — author site with storefront integration"
  ],
  pillars: [
    "Authentic Voice — preserving what makes each author unique",
    "Professional Quality — publishing-industry-grade output at every step",
    "Accessible Empowerment — no prior publishing knowledge required",
    "Ethical AI — transparent AI with author IP ownership guaranteed",
    "Community & Legacy — authors feel supported and celebrated",
    "Innovation Leadership — cutting-edge tools delivered continuously",
    "Sustainable Business — pricing that respects author budgets",
    "Brand Integrity — consistent, trustworthy experience platform-wide"
  ],
  service_standards: [
    "Every author feels seen, heard, and celebrated from day one",
    "No author is left confused — every step has clear guidance and AI support",
    "Response to author questions within 24 hours (human) or instantly (AI)",
    "First publishing milestone celebrated with the author personally",
    "Monthly check-in at 30, 60, 90 days post-onboarding",
    "Zero tolerance for author frustration going unaddressed",
    "Author NPS target: 70+ (world-class service benchmark)",
    "Every interaction reinforces: 'You are a real author. This platform is built for you.'"
  ]
};

const ONBOARDING_STEPS = [
  "Welcome & Account Activation",
  "Author Profile & Vision Setup",
  "Platform Tour & AI Introduction",
  "First Book Project Creation",
  "Title & Concept Validation",
  "Outline Generation Experience",
  "First Chapter Writing Session",
  "Publishing Roadmap Review"
];

function buildDocHTML(content, generatedDate, versionNumber) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;color:#1e293b;line-height:1.75;background:#fff;padding:0;">

  <div style="background:linear-gradient(135deg,#0f172a 0%,#1a1a3e 60%,#0f1a2e 100%);padding:52px 48px 44px;">
    <p style="color:#f59e0b;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">The Write Vibe · Experience Design Document · Investor & Agent Confidential</p>
    <h1 style="font-size:36px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;line-height:1.1;">Author Onboarding Experience</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 6px;">How The Write Vibe Delivers an Exemplary First Experience to Every New Author</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">The Write Vibe — AI-Powered Self-Publishing Platform</p>
    <div style="display:flex;flex-wrap:wrap;gap:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:16px 24px;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Version</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Generated</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${generatedDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Document Type</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">Experience Design</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Pillars Applied</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">All 8</p></div>
    </div>
  </div>

  <div style="padding:48px;">
    ${content}
  </div>

  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:24px 48px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe. All rights reserved. Investor & Agent Confidential.</p>
    <p style="color:#cbd5e1;font-size:11px;margin:6px 0 0;">Author Onboarding Experience v${versionNumber} · Generated ${generatedDate} · hello@thewritevibe.com</p>
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
    const DOC_TYPE = 'onboarding_experience';

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
PLATFORM: ${PLATFORM_CONTEXT.name} — ${PLATFORM_CONTEXT.tagline}
CORE OFFERING: ${PLATFORM_CONTEXT.core_offering}

PUBLISHING WORKFLOW:
${PLATFORM_CONTEXT.publishing_workflow.join('\n')}

TARGET AUTHOR PROFILE:
${PLATFORM_CONTEXT.target_author.profile}
Motivations: ${PLATFORM_CONTEXT.target_author.motivations.join('; ')}
Pain Points: ${PLATFORM_CONTEXT.target_author.pain_points.join('; ')}

AI TOOLS & AGENTS:
${PLATFORM_CONTEXT.ai_tools.join('\n')}

8 BRAND PILLARS:
${PLATFORM_CONTEXT.pillars.join('\n')}

EXEMPLARY SERVICE STANDARDS:
${PLATFORM_CONTEXT.service_standards.join('\n')}`;

      const prompt = `You are a world-class customer experience designer and CX strategist specializing in SaaS onboarding for creative platforms. Generate a complete, professional Author Onboarding Experience Design Document for The Write Vibe — an AI-powered self-publishing platform.

PLATFORM CONTEXT:
${contextBlock}

Generate ALL of the following sections in this exact order:

SECTION 1: EXECUTIVE SUMMARY
A compelling 2-3 paragraph overview of The Write Vibe's onboarding philosophy, the author experience promise, and why exceptional onboarding is the platform's most important growth lever. Include the core thesis: every author who completes onboarding becomes an invested, publishing author — not just a subscriber.

SECTION 2: TARGET AUTHOR PERSONA
Detailed portrait of the ideal author who goes through this onboarding. Include emotional state at sign-up, what they're hoping for, what they fear, and what success looks like to them. Make this vivid and specific.

SECTION 3: PRE-ONBOARDING EXPERIENCE
Cover three sub-sections:
- Author Discovery & Acquisition Touchpoints (how they find The Write Vibe — organic, paid, referral, content)
- First Platform Impression (landing page experience, emotional promise, what they see and feel before signing up)
- Expectation Setting & Promise Delivery (what is communicated at sign-up, what the platform promises, how that promise is reinforced in the first 60 seconds)

SECTION 4: ONBOARDING FLOW — STEP BY STEP
For each of these 8 steps, generate a complete step block:
${ONBOARDING_STEPS.map((s, i) => `Step ${i+1}: ${s}`).join('\n')}

For EACH step include ALL of these fields:
- Step Name & Number
- Touchpoint Type (in-app, email, AI agent, human, automated)
- Experience Delivered (what happens, what the author sees/feels/does — be specific and evocative)
- AI or Human Responsible (which agent or team member owns this step)
- Success Criteria (how we know this step was completed with excellence)
- Estimated Time (how long this step takes the author)
- Pillar Alignment (which of the 8 pillars this step primarily serves)
- Exemplary Service Standard (the gold-standard version of delivering this step — what makes it 10/10)

SECTION 5: POST-ONBOARDING EXPERIENCE
Three sub-sections:
- First Publishing Milestone Moment (when and how the author publishes their first chapter or completes their outline — describe the celebration and acknowledgment)
- Author Success Check-In Cadence (30/60/90 day check-in structure — who reaches out, what is asked, what is offered)
- Escalation Path (if author experience falls below standard — what triggers escalation, who responds, what the resolution looks like, and how the author's trust is restored)

SECTION 6: ONBOARDING METRICS & DURATION
- Total onboarding duration (time from sign-up to first book project creation)
- Key completion milestones and their timing
- Drop-off risk points and mitigation strategies
- Success metrics table (metric name, target, measurement method)

SECTION 7: EXEMPLARY SERVICE SCORE FRAMEWORK
Design a scoring rubric (0–100) for measuring how well each onboarding step was delivered. Include:
- Scoring dimensions (e.g., speed, clarity, emotional impact, AI accuracy, personalization)
- Weight per dimension
- What constitutes a 10/10 step vs. a 6/10 step
- How scores are aggregated into an overall Onboarding Excellence Score

SECTION 8: INVESTOR INSIGHT — HOW ONBOARDING DRIVES RETENTION & REVENUE
A professional 2-3 paragraph section written directly to investors explaining:
- The direct correlation between onboarding completion rate and 90-day retention
- How the first publishing milestone acts as an "aha moment" that locks in LTV
- The unit economics of an author who completes onboarding vs. one who churns in week 1
- Why this onboarding design is a defensible competitive moat

Use professional experience design language throughout. Be specific, evocative, and emotionally intelligent. Format with clean HTML using <h2>, <h3>, <h4>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em> tags only, NO inline styles.

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

      const sectionAccents = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];

      const innerHtml = (result.sections || []).map((sec, idx) => {
        const accent = sectionAccents[idx % sectionAccents.length];
        const isStep = sec.title.toLowerCase().includes('step') || sec.title.toLowerCase().includes('onboarding flow');
        return `
<div style="margin-bottom:52px;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:${isStep ? '6' : '16'}px;">
    <div style="width:36px;height:36px;border-radius:8px;background:${accent}18;border:1px solid ${accent}30;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:${accent};font-size:13px;font-weight:700;">${idx + 1}</span>
    </div>
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.5px;">${sec.title}</h2>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}00);border-radius:2px;margin-bottom:20px;"></div>
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
        title: 'The Write Vibe — Author Onboarding Experience Design Document',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `AI-generated ${new Date().toLocaleDateString()} · ${(result.sections||[]).length} sections · 8 onboarding steps · full pre/post experience`
      });

      return Response.json({ success: true, doc: saved });
    }

    // ── REGENERATE STEP ───────────────────────────────────────────────────────
    if (action === 'regenerate_step') {
      const { step_name } = body;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a world-class CX experience designer. Rewrite the onboarding step "${step_name}" for The Write Vibe (AI-powered self-publishing platform). 

Include all fields: Step Name, Touchpoint Type, Experience Delivered (vivid and specific), AI or Human Responsible, Success Criteria, Estimated Time, Pillar Alignment, and Exemplary Service Standard.

Format as professional HTML using <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em> tags only, no inline styles.
Return JSON: { "content": "HTML content" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });
      return Response.json({ success: true, step: step_name, content: result.content });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});