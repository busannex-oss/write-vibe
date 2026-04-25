import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AGENT_MANIFEST = [
  { name: "Project Manager", type: "orchestration", description: "Master AI overseeing all agents, enforcing zero-error policy, brand standards, daily reports", pillars: ["Innovation Leadership", "Brand Integrity", "Sustainable Business"], tools: ["Book(read,update)", "Document(read,update)", "TeamMember(read)"], memory: true, status: "active" },
  { name: "Brand Strategist", type: "brand", description: "Maintains brand standards, visual identity, white-label enforcement across all user touchpoints", pillars: ["Brand Integrity", "Authentic Voice"], tools: [], memory: true, status: "active" },
  { name: "Brand Sentinel", type: "monitoring", description: "Continuous brand consistency guardian monitoring all platform outputs", pillars: ["Brand Integrity", "Authentic Voice"], tools: [], memory: true, status: "active" },
  { name: "Brand Guardian", type: "monitoring", description: "Author content brand protection across marketing materials", pillars: ["Brand Integrity", "Authentic Voice"], tools: [], memory: true, status: "active" },
  { name: "Structure Sentinel", type: "monitoring", description: "Manuscript structure and narrative arc monitor", pillars: ["Authentic Voice", "Professional Quality"], tools: [], memory: true, status: "active" },
  { name: "Marketing Assistant", type: "content", description: "Creates publisher letters, press releases, social media content, email newsletters", pillars: ["Community & Legacy", "Accessible Empowerment"], tools: ["Book(read)", "Document(create,read,update)"], memory: true, status: "active" },
  { name: "SEO Growth Engine", type: "optimization", description: "Continuous keyword optimization and Amazon discoverability enhancement", pillars: ["Professional Quality", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Outline Generator", type: "content", description: "Creates comprehensive chapter-by-chapter book outlines with story architecture", pillars: ["Authentic Voice", "Professional Quality"], tools: ["Book(read,update)"], memory: true, status: "active" },
  { name: "Character Creator", type: "content", description: "AI-driven deep character profiles with backstory, traits, appearance", pillars: ["Authentic Voice"], tools: [], memory: true, status: "active" },
  { name: "Title Suggester", type: "content", description: "Market-aware, commercially viable title generation", pillars: ["Professional Quality", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Summary Writer", type: "content", description: "Back-cover book description and Amazon blurb generation", pillars: ["Professional Quality", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Cover Designer", type: "creative", description: "AI front and back cover generation with style selection and voting", pillars: ["Professional Quality", "Authentic Voice"], tools: [], memory: true, status: "active" },
  { name: "Audiobook Producer", type: "production", description: "AI voice narration with style selection and script review", pillars: ["Professional Quality", "Innovation Leadership"], tools: [], memory: true, status: "active" },
  { name: "Video Producer", type: "production", description: "Book commercial video creation pipeline", pillars: ["Innovation Leadership", "Community & Legacy"], tools: [], memory: true, status: "active" },
  { name: "Website Builder", type: "production", description: "Author site content, structure, and storefront integration", pillars: ["Community & Legacy", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Bookstore Advisor", type: "distribution", description: "Distribution channel strategy and retailer optimization", pillars: ["Professional Quality", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Lead Magnet Designer", type: "marketing", description: "Reader acquisition asset creation and lead funnel design", pillars: ["Community & Legacy", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Text Formatter", type: "quality", description: "Platform-standard formatting application for KDP/ACX compliance", pillars: ["Professional Quality"], tools: [], memory: true, status: "active" },
  { name: "Seasonal Newsletter Strategist", type: "marketing", description: "Author marketing calendar and seasonal campaign management", pillars: ["Community & Legacy", "Sustainable Business"], tools: [], memory: true, status: "active" },
  { name: "Diagnostics Agent", type: "monitoring", description: "Platform and workflow issue detection and resolution", pillars: ["Innovation Leadership", "Brand Integrity"], tools: [], memory: true, status: "active" },
  { name: "Membership Manager", type: "business", description: "Subscription and access tier management", pillars: ["Sustainable Business", "Accessible Empowerment"], tools: [], memory: true, status: "active" },
  { name: "Media Production Monitor", type: "monitoring", description: "Automated daily health check for video/audio jobs and ElevenLabs quota", pillars: ["Professional Quality", "Innovation Leadership"], tools: [], memory: false, status: "degraded", notes: "6/6 consecutive failures — automation inactive" }
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

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5',
        response_json_schema: {
          type: "object",
          properties: {
            sections: { type: "array", items: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } },
            health_score: { type: "number" },
            red_flags: { type: "array", items: { type: "string" } },
            active_count: { type: "number" },
            degraded_count: { type: "number" }
          }
        }
      });

      const healthScore = result.health_score || 74;
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