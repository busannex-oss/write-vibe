import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AGENT_MANIFEST = [
  { name: "Project Manager", type: "orchestration", description: "Master AI overseeing all agents, enforcing zero-error policy, brand standards, daily reports", pillars: ["Innovation Leadership", "Brand Integrity", "Sustainable Business"], tools: ["Book(read,update)", "Document(read,update)", "TeamMember(read)"], memory: true, status: "active" },
  { name: "Brand Guardian", type: "brand", description: "Unified brand strategist & enforcement agent — merged Brand Strategist + Brand Guardian + Brand Sentinel. Maintains visual identity standards, white-label compliance, brand consistency across all touchpoints, and autonomous repair of brand violations. Monitors author website branding, social media presence, cover design standards, and metadata compliance.", pillars: ["Brand Integrity", "Authentic Voice", "Professional Quality"], tools: ["Book(read,update)", "Document(read,update)"], memory: true, status: "active" },
  { name: "Structure Sentinel", type: "monitoring", description: "Manuscript structure and narrative arc monitor", pillars: ["Authentic Voice", "Professional Quality"], tools: [], memory: true, status: "active" },
  { name: "Marketing Assistant", type: "content", description: "Full-spectrum marketing content creator: publisher letters, press releases, social media campaigns (Instagram, TikTok, Facebook, Twitter, LinkedIn), email newsletters, book launch strategies, reader acquisition funnels, and promotional material optimization. Tailors messaging for multiple audience segments and sales channels.", pillars: ["Community & Legacy", "Accessible Empowerment", "Sustainable Business"], tools: ["Book(read)", "Document(create,read,update)", "NewsletterSubscriber(read)"], memory: true, status: "active" },
  { name: "Title & SEO Strategist", type: "optimization", description: "Unified title generation + full-stack SEO strategy — keyword research, metadata, on-page, off-page, traffic optimization", pillars: ["Professional Quality", "Sustainable Business", "Accessible Empowerment"], tools: ["Book(read,update)", "NewsletterSubscriber(read)"], memory: true, status: "active" },
  { name: "Outline Generator", type: "content", description: "Creates comprehensive chapter-by-chapter book outlines with story architecture", pillars: ["Authentic Voice", "Professional Quality"], tools: ["Book(read,update)"], memory: true, status: "active" },
  { name: "Character Creator", type: "content", description: "Advanced character development engine: creates multi-dimensional character profiles with deep backstories, personality archetypes, trait matrices, relationship dynamics, visual appearance guidance, character voice consistency checks, and evolution arcs across narrative. Supports protagonist/antagonist/supporting cast development with psychological depth.", pillars: ["Authentic Voice", "Professional Quality"], tools: ["Book(read,update)"], memory: true, status: "active" },
  { name: "Summary Writer", type: "content", description: "Back-cover book description and Amazon blurb generation", pillars: ["Professional Quality", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Book Cover AI Agent", type: "creative", description: "Specialized high-quality cover design engine: generates front/back/spine covers with professional-grade aesthetics, market genre analysis, AI visual composition optimization, typography hierarchy, color psychology alignment, competitive positioning, and iterative refinement through voting/feedback loops. Supports multiple style variations, mockup generation, and print-ready file preparation.", pillars: ["Professional Quality", "Authentic Voice", "Innovation Leadership"], tools: ["Book(read,update)", "Document(create,read)"], memory: true, status: "active" },
  { name: "Audiobook Producer", type: "production", description: "AI voice narration with style selection and script review", pillars: ["Professional Quality", "Innovation Leadership"], tools: [], memory: true, status: "active" },
  { name: "Video Producer", type: "production", description: "Full-cycle book video commercial production — strategy, scripting, storyboarding, FFmpeg rendering, multi-channel distribution (YouTube, Instagram, TikTok, Facebook)", pillars: ["Innovation Leadership", "Community & Legacy", "Professional Quality"], tools: ["Book(read,update)", "Document(read,update)", "ErrorLog(create)"], memory: true, status: "active" },
  { name: "Website Builder", type: "production", description: "Author site content, structure, and storefront integration", pillars: ["Community & Legacy", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Bookstore Advisor", type: "distribution", description: "Distribution channel strategy and retailer optimization", pillars: ["Professional Quality", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Lead Magnet Designer", type: "marketing", description: "Reader acquisition asset creation and lead funnel design", pillars: ["Community & Legacy", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Text Formatter", type: "quality", description: "Platform-standard formatting application for KDP/ACX compliance", pillars: ["Professional Quality"], tools: [], memory: true, status: "active" },
  { name: "Seasonal Newsletter Strategist", type: "marketing", description: "Author marketing calendar and seasonal campaign management", pillars: ["Community & Legacy", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Diagnostics Agent", type: "monitoring", description: "Platform and workflow issue detection and resolution", pillars: ["Innovation Leadership", "Brand Integrity"], tools: [], memory: true, status: "active" },
  { name: "Membership Manager", type: "business", description: "Subscription and access tier management", pillars: ["Sustainable Business", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Ethical AI & Compliance Officer", type: "compliance", description: "Critical-urgency agent: policy/bias/safety checks, consent verification, IP protection across all AI outputs", pillars: ["Ethical AI", "Brand Integrity", "Professional Quality"], tools: ["Book(read)", "Document(read)", "AgentMemory(create,read)", "ErrorLog(create,read)"], memory: true, status: "active" },
  { name: "Automation Orchestrator", type: "orchestration", description: "High-urgency agent: schedules, monitors, retries, and escalates all automations with 4-tier SLA enforcement", pillars: ["Innovation Leadership", "Professional Quality", "Sustainable Business"], tools: ["Book(read)", "AgentMemory(create,read,update)", "ErrorLog(create,read,update)"], memory: true, status: "active" },
  // ── Advisory Board AI Agents ─────────────────────────────────────────────
  { name: "Oprah Winfrey Advisory AI", type: "advisory", description: "Strategic advisor modeled on Oprah's expertise in storytelling, audience empathy, personal transformation narratives, and media brand building. Provides high-level guidance on author voice authenticity, emotional resonance, community impact, and book club potential for maximum cultural reach.", pillars: ["Authentic Voice", "Community & Legacy", "Accessible Empowerment"], tools: ["Book(read)", "Document(read)"], memory: true, status: "active" },
  { name: "Maya Angelou Advisory AI", type: "advisory", description: "Literary advisory agent modeled on Maya Angelou's mastery of poetic prose, memoir, resilience narratives, and the power of authentic lived experience. Reviews manuscript voice, emotional truth, cultural dignity, and the enduring legacy value of each author's work.", pillars: ["Authentic Voice", "Community & Legacy", "Ethical AI"], tools: ["Book(read)"], memory: true, status: "active" },
  { name: "Yoshua Bengio Advisory AI", type: "advisory", description: "AI ethics and safety advisory agent modeled on Yoshua Bengio's leadership in responsible AI research. Audits all AI-generated outputs for bias, safety risks, transparency, fairness, and alignment with responsible AI development principles across the platform.", pillars: ["Ethical AI", "Innovation Leadership", "Professional Quality"], tools: ["AgentMemory(read)", "ErrorLog(read)", "Document(read)"], memory: true, status: "active" },
  { name: "Jeff Bezos Advisory AI", type: "advisory", description: "Business strategy and customer-obsession advisory agent modeled on Jeff Bezos's principles: long-term thinking, flywheel growth, operational excellence, and working backwards from the customer. Advises on platform scalability, membership economics, distribution strategy, and author success metrics.", pillars: ["Sustainable Business", "Innovation Leadership", "Accessible Empowerment"], tools: ["Book(read)", "Document(read)"], memory: true, status: "active" }
];

const PILLARS = ["Authentic Voice", "Professional Quality", "Accessible Empowerment", "Ethical AI", "Community & Legacy", "Innovation Leadership", "Sustainable Business", "Brand Integrity"];

function buildDocHTML(content, generatedDate, versionNumber, healthScore) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:980px;margin:0 auto;color:#1e293b;line-height:1.75;background:#fff;padding:0;">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#0a1628 60%,#0f172a 100%);padding:48px 48px 40px;">
    <p style="color:#f59e0b;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 14px;font-weight:600;">The Write Vibe · AI Agent Audit · Admin Confidential</p>
    <h1 style="font-size:34px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-1.5px;">AI Agent Audit, Diagnostics & Alignment Report</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">Comprehensive assessment of The Write Vibe agent ecosystem</p>
    <div style="display:flex;flex-wrap:wrap;gap:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:14px 22px;">
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Doc Version</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">v${versionNumber}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Generated</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${generatedDate}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Agents Audited</p><p style="color:#fbbf24;font-size:15px;font-weight:700;margin:0;">${AGENT_MANIFEST.length}</p></div>
      <div style="width:1px;background:rgba(255,255,255,0.07);"></div>
      <div><p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:600;">Overall Health</p><p style="color:${healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#f59e0b' : '#ef4444'};font-size:15px;font-weight:700;margin:0;">${healthScore}/100</p></div>
    </div>
  </div>
  <div style="padding:48px;">
    ${content}
  </div>
  <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:22px 48px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} The Write Vibe — AI Agent Audit v${versionNumber} · ${generatedDate} · admin@thewritevibe.com</p>
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
    const DOC_TYPE = 'agent_audit';

    // ── GET CURRENT ────────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const doc = all.find(d => d.doc_type === DOC_TYPE && d.is_current)
                || all.find(d => d.doc_type === DOC_TYPE)
                || null;
      const manifest = AGENT_MANIFEST.map(a => ({
        name: a.name, type: a.type, status: a.status, pillars: a.pillars, notes: a.notes || null
      }));
      return Response.json({ success: true, doc, manifest, total_agents: AGENT_MANIFEST.length, pillars: PILLARS });
    }

    // ── VERSION HISTORY ────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const versions = all.filter(d => d.doc_type === DOC_TYPE).map(d => ({
        id: d.id, version_number: d.version_number, generated_at: d.generated_at,
        is_current: d.is_current, generation_notes: d.generation_notes,
        health_score: d.risk_analysis?.health_score || null
      }));
      return Response.json({ success: true, versions });
    }

    // ── RESTORE ────────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: d.id === id })));
      return Response.json({ success: true, doc: sameType.find(d => d.id === id) });
    }

    // ── SAVE ───────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html } = body;
      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 20);
      const current = all.find(d => d.doc_type === DOC_TYPE && d.is_current) || all.find(d => d.doc_type === DOC_TYPE);
      if (current) {
        await base44.asServiceRole.entities.LegalDocument.update(current.id, { content_html, generated_at: new Date().toISOString() });
        return Response.json({ success: true });
      }
      return Response.json({ error: 'No document to save' }, { status: 404 });
    }

    // ── GENERATE / FULL AUDIT ─────────────────────────────────────────────────
    if (action === 'generate' || action === 'run_audit') {
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const activeAgents = AGENT_MANIFEST.filter(a => a.status === 'active').length;
      const degradedAgents = AGENT_MANIFEST.filter(a => a.status === 'degraded').length;

      // Fetch error logs for context
      let errorLogs = [];
      try {
        errorLogs = await base44.asServiceRole.entities.ErrorLog.list('-created_date', 20);
      } catch(e) { errorLogs = []; }

      const agentContext = AGENT_MANIFEST.map(a =>
        `AGENT: ${a.name} | Type: ${a.type} | Status: ${a.status} | Pillars: ${a.pillars.join(', ')} | Tools: ${a.tools.length > 0 ? a.tools.join(', ') : 'none'} | Memory: ${a.memory} | Notes: ${a.notes || 'none'}`
      ).join('\n');

      const pillarMap = {};
      PILLARS.forEach(p => { pillarMap[p] = AGENT_MANIFEST.filter(a => a.pillars.includes(p)).map(a => a.name); });

      const prompt = `You are a senior AI systems architect and platform auditor. Generate a complete AI Agent Audit, Diagnostics & Alignment Report for The Write Vibe — an AI-powered self-publishing platform.

PLATFORM AGENT MANIFEST (${AGENT_MANIFEST.length} registered agents):
${agentContext}

PILLAR COVERAGE MAP:
${PILLARS.map(p => `${p}: [${pillarMap[p].join(', ')}]`).join('\n')}

AUTOMATION STATUS:
- Daily Media Production Monitor: 6/6 consecutive failures — automation currently inactive (deactivated)
- No other scheduled automations active

RECENT ERROR ACTIVITY: ${errorLogs.length} error log entries on record

Generate ALL sections in this exact order with professional, investor-grade language:

SECTION 1: AUDIT SUMMARY
Executive overview with a clean HTML table showing:
- Total agents registered: ${AGENT_MANIFEST.length}
- Total agents active: ${activeAgents}
- Total agents degraded: ${degradedAgents}
- Total agents inactive: 0
- Agents missing pillar alignment: (identify any from manifest)
- Agents with overlapping functions: (identify any from manifest — e.g. Brand Sentinel vs Brand Guardian vs Brand Strategist overlap)
- Agents with no defined tools: (list count and names)
- Critical flags requiring immediate action

Then 2-3 paragraphs: Overall health narrative, what the audit found, what the strategic implications are for investors/agents reviewing the platform.

SECTION 2: DIAGNOSTICS REPORT — PER-AGENT ASSESSMENT
For EACH of the ${AGENT_MANIFEST.length} agents, generate a structured entry:
- Agent name, type, and operational status badge
- Performance assessment: Optimal / Degraded / Needs Review / Active (based on what you know)
- Role clarity: Is this agent's purpose clearly defined and distinct?
- Pillar alignment assessment: Are the assigned pillars appropriate?
- Tool access assessment: Does this agent have the right tools for its function?
- Conflict detection: Does this agent produce outputs that could conflict with another agent?
- Risk flag: Any risk to author experience, platform reputation, or investor confidence?
- Recommendation: specific action for this agent

IMPORTANT: Flag these specifically:
- "Media Production Monitor" automation as DEGRADED/FAILING with 6 consecutive failures
- "Brand Sentinel" + "Brand Guardian" + "Brand Strategist" as potential overlap — assess whether all three are needed or if consolidation should be considered
- "Diagnostics Agent" as needing better tool access definition
- Any agents with NO tools and NO memory that serve a monitoring function

SECTION 3: MANAGEMENT RECOMMENDATIONS
For each agent, a brief management action recommendation (active, monitor, consolidate, upgrade, retire). Group by action type into a clean table.

SECTION 4: ALIGNMENT REPORT
Subsections:
- Pillar Coverage Map: table showing each pillar, number of agents assigned, names, and coverage strength (Strong/Adequate/Weak)
- Agent Cohesion Score: how well the ecosystem functions without conflict — score with explanation
- Platform Standard Alignment: are all agents producing investor-grade and author-facing outputs?
- Harmful Agent Detection: comprehensive assessment — are any agent behavior patterns degrading rather than serving the platform?
- Recommended New Agents: 3-5 agents that should be built to fill identified gaps (be specific — name the agent, its function, pillar alignment, and urgency)

SECTION 5: OVERALL PLATFORM AGENT HEALTH SCORE
- Composite score (number out of 100, be realistic — around 74 given the automation failures and overlaps)
- Score breakdown table: Audit completeness, Diagnostics health, Alignment coverage, Conflict risk, Gap risk
- Trend assessment: is health improving or declining based on the data
- Priority action list: top 5 actions ranked by urgency and strategic impact (numbered, specific)
- Investor confidence statement: 1 paragraph written directly to investors about the agent ecosystem's maturity and trajectory

Format with clean, professional HTML: <h2>, <h3>, <h4>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>. NO inline styles. Be specific, authoritative, and precise.

Return JSON: { "sections": [{ "title": "section title", "content": "full HTML" }], "health_score": number, "red_flags": ["flag1", "flag2"], "active_count": number, "degraded_count": number }`;

      // Run 3 parallel LLM calls to avoid timeout
      const sectionSchema = { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } };
      const advisoryAgents = AGENT_MANIFEST.filter(a => a.type === 'advisory').map(a => a.name).join(', ');
      const baseCtx = `Platform: The Write Vibe (${AGENT_MANIFEST.length} agents, including 4 Advisory Board AI Agents: ${advisoryAgents}). Manifest:\n${agentContext}\nPillar map:\n${PILLARS.map(p => `${p}: [${pillarMap[p].join(', ')}]`).join('\n')}\nAutomation: Media Production Monitor has 6/6 consecutive failures — inactive.\nErrors on record: ${errorLogs.length}.`;

      const [part1, part2, part3] = await Promise.all([
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `${baseCtx}\n\nGenerate SECTION 1: AUDIT SUMMARY and SECTION 2: DIAGNOSTICS REPORT — PER-AGENT ASSESSMENT.\nSection 1: Executive HTML table (total/active/degraded/overlapping/no-tools agents + critical flags) + 2-3 narrative paragraphs.\nSection 2: For EACH of ${AGENT_MANIFEST.length} agents: status, role clarity, pillar fit, tool access, conflict detection, risk flag, recommendation. Flag Brand Guardian consolidation (was Brand Sentinel+Brand Guardian). Flag Media Production Monitor as DEGRADED.\nProfessional investor-grade HTML. No inline styles.\nReturn JSON: { "sections": [{ "title": string, "content": string }, { "title": string, "content": string }] }`,
          response_json_schema: { type: "object", properties: { sections: { type: "array", items: sectionSchema } } }
        }),
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `${baseCtx}\n\nGenerate SECTION 3: MANAGEMENT RECOMMENDATIONS and SECTION 4: ALIGNMENT REPORT.\nSection 3: For each agent a management action (active/monitor/consolidate/upgrade/retire) grouped in a clean table.\nSection 4: Pillar Coverage Map table (pillar, agents, coverage strength Strong/Adequate/Weak); Agent Cohesion Score; Platform Standard Alignment; Harmful Agent Detection; Recommended New Agents (3-5, name/function/pillar/urgency).\nProfessional HTML. No inline styles.\nReturn JSON: { "sections": [{ "title": string, "content": string }, { "title": string, "content": string }] }`,
          response_json_schema: { type: "object", properties: { sections: { type: "array", items: sectionSchema } } }
        }),
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `${baseCtx}\n\nGenerate SECTION 5: OVERALL PLATFORM AGENT HEALTH SCORE.\nInclude: composite score out of 100 (be realistic ~76 given automation failures and recent consolidations), score breakdown table (Audit completeness/Diagnostics health/Alignment coverage/Conflict risk/Gap risk), trend assessment, top 5 priority actions ranked by urgency, investor confidence statement paragraph.\nAlso output: health_score (number), red_flags (array of strings for critical issues), active_count (${activeAgents}), degraded_count (${degradedAgents}).\nProfessional HTML. No inline styles.\nReturn JSON: { "sections": [{ "title": string, "content": string }], "health_score": number, "red_flags": [string], "active_count": number, "degraded_count": number }`,
          response_json_schema: { type: "object", properties: { sections: { type: "array", items: sectionSchema }, health_score: { type: "number" }, red_flags: { type: "array", items: { type: "string" } }, active_count: { type: "number" }, degraded_count: { type: "number" } } }
        })
      ]);

      const allSections = [...(part1.sections || []), ...(part2.sections || []), ...(part3.sections || [])];
      const result = {
        sections: allSections,
        health_score: part3.health_score || 76,
        red_flags: part3.red_flags || [],
        active_count: part3.active_count || activeAgents,
        degraded_count: part3.degraded_count || degradedAgents
      };

      const healthScore = result.health_score || 76;
      const sectionColors = ['#f59e0b','#ef4444','#3b82f6','#8b5cf6','#10b981'];

      const innerHtml = (result.sections || []).map((sec, idx) => {
        const accent = sectionColors[idx % sectionColors.length];
        const labels = ['01', '02', '03', '04', '05'];
        return `<div style="margin-bottom:52px;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
    <div style="width:40px;height:40px;border-radius:10px;background:${accent}18;border:2px solid ${accent}35;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:${accent};font-size:12px;font-weight:800;">${labels[idx] || idx+1}</span>
    </div>
    <h2 style="font-size:21px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.5px;">${sec.title}</h2>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}00);border-radius:2px;margin-bottom:22px;"></div>
  <div style="font-size:14px;line-height:1.85;color:#374151;">${sec.content}</div>
</div>`;
      }).join('');

      // Check for critical flags and alert admin
      const criticalFlags = result.red_flags || [];
      const hasCritical = criticalFlags.length > 0 || degradedAgents > 0;

      if (hasCritical && user.email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: `⚠️ The Write Vibe — AI Agent Audit Alert: ${criticalFlags.length} Flag(s) Detected`,
            body: `<h2>AI Agent Audit — Critical Flags Detected</h2>
<p>The automated AI Agent Audit for The Write Vibe has detected the following issues requiring immediate attention:</p>
<ul>${criticalFlags.map(f => `<li>${f}</li>`).join('')}</ul>
<p><strong>Platform Agent Health Score:</strong> ${healthScore}/100</p>
<p><strong>Degraded Agents:</strong> ${degradedAgents}</p>
<p>Log in to the Admin panel → AI Agent Audit to review the full report and take action.</p>
<p><em>Audit run: ${generatedDate}</em></p>`
          });
        } catch(e) { /* email failure non-critical */ }
      }

      const all = await base44.asServiceRole.entities.LegalDocument.list('-version_number', 50);
      const sameType = all.filter(d => d.doc_type === DOC_TYPE);
      const latestVersion = sameType[0]?.version_number || 0;
      await Promise.all(sameType.map(d => base44.asServiceRole.entities.LegalDocument.update(d.id, { is_current: false })));

      const content_html = buildDocHTML(innerHtml, generatedDate, latestVersion + 1, healthScore);

      const saved = await base44.asServiceRole.entities.LegalDocument.create({
        doc_type: DOC_TYPE,
        version_number: latestVersion + 1,
        title: 'The Write Vibe — AI Agent Audit & Alignment Report',
        content_html,
        effective_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        is_current: true,
        risk_analysis: {
          health_score: healthScore,
          red_flags: criticalFlags,
          active_count: activeAgents,
          degraded_count: degradedAgents,
          overall_risk: healthScore >= 80 ? 'low' : healthScore >= 60 ? 'medium' : 'high'
        },
        generation_notes: `AI audit ${new Date().toLocaleDateString()} · ${AGENT_MANIFEST.length} agents · health ${healthScore}/100 · ${criticalFlags.length} flags`
      });

      return Response.json({ success: true, doc: saved, health_score: healthScore, red_flags: criticalFlags, active_count: activeAgents, degraded_count: degradedAgents });
    }

    // ── REGENERATE SECTION ─────────────────────────────────────────────────────
    if (action === 'regenerate_section') {
      const { section_name } = body;
      const agentContext = AGENT_MANIFEST.map(a => `${a.name} (${a.type}, ${a.status}, pillars: ${a.pillars.join('/')})`).join('\n');
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Rewrite the "${section_name}" section of The Write Vibe AI Agent Audit report.
Agent manifest: ${agentContext}
Be specific, investor-grade, and authoritative. Format as professional HTML using <h3>, <h4>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong> tags only, no inline styles.
Return JSON: { "content": "HTML content" }`,
        response_json_schema: { type: "object", properties: { content: { type: "string" } } }
      });
      return Response.json({ success: true, content: result.content });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});