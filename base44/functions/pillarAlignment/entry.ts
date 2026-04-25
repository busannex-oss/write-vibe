import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILLARS = [
  { name: "Authenticity", color: "#f59e0b" },
  { name: "Creativity",   color: "#8b5cf6" },
  { name: "Empowerment",  color: "#10b981" },
  { name: "Innovation",   color: "#3b82f6" },
  { name: "Community",    color: "#f97316" },
  { name: "Excellence",   color: "#ec4899" },
  { name: "Integrity",    color: "#06b6d4" },
  { name: "Growth",       color: "#84cc16" }
];

const PLATFORM_SNAPSHOT = {
  pages: [
    "Landing", "Dashboard", "Books", "BookEditor", "CreateBook", "Documents",
    "Team", "Settings", "Pricing", "About", "Contact", "FAQ", "HowItWorks",
    "Privacy", "Terms", "CookiePolicy", "BookWebsite", "Investor", "UserManagement",
    "ErrorDashboard", "AgentMemoryLog", "MissionStatement", "SOPs", "MasterRegistry",
    "ProjectReports", "MapLegend"
  ],
  aiAgents: [
    "Project Manager", "Brand Strategist", "Character Creator", "Outline Generator",
    "Marketing Assistant", "Video Producer", "Audiobook Producer", "Media Production",
    "Website Builder", "Membership Manager", "Lead Magnet Designer", "Diagnostics Agent",
    "Brand Sentinel", "Seasonal Newsletter Strategist", "Structure Sentinel",
    "SEO Growth Engine", "Text Formatter", "Brand Guardian", "Title Suggester",
    "Summary Writer", "Cover Designer", "Bookstore Advisor"
  ],
  aiTools: [
    "AI Manuscript Writer", "AI Chapter Generator", "AI Cover Designer",
    "AI Audiobook Generator", "AI Video Commercial Creator", "AI Marketing Campaign Generator",
    "AI Outline Generator", "AI Detailed Outline", "AI Industry Outline",
    "AI Character Creator", "AI Book Summary Generator", "AI SEO Metadata Editor",
    "AI Manuscript Formatter", "AI Website Content Generator", "AI Lead Magnet Hub",
    "AI White Paper Generator", "AI Amazon Publisher", "AI Amazon Review Importer",
    "AI Editor Panel", "Character Relationship Mapper", "AI Cover Compositor",
    "Chapter Version History", "AI Business Plan Generator"
  ],
  integrations: [
    "Amazon KDP (Kindle Direct Publishing)", "Amazon ACX (Audiobook Creation Exchange)",
    "Google AI Studio (Gemini)", "Stripe Payments", "Email (Resend)",
    "WhatsApp (Agent channel)", "Telegram (Agent channel)",
    "File Storage (Base44 CDN)", "PDF Export (jsPDF)"
  ],
  foundationalDocuments: [
    { name: "Mission Statement", status: "active" },
    { name: "Standard Operating Procedures Library", status: "active" },
    { name: "Master Element Registry", status: "active" },
    { name: "Map Legend", status: "active" },
    { name: "Pillar Alignment Report", status: "in_progress" },
    { name: "Project Reports", status: "active" },
    { name: "Agent Memory Log", status: "active" },
    { name: "White Papers", status: "in_progress" },
    { name: "Privacy Policy", status: "active" },
    { name: "Terms of Service", status: "active" },
    { name: "Cookie Policy", status: "active" }
  ]
};

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
      const all = await base44.asServiceRole.entities.PillarAlignment.list('-version_number', 50);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, report: current });
    }

    // ── GET VERSIONS ─────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.PillarAlignment.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes,
        overall_score: r.overall_score
      }))});
    }

    // ── RESTORE ───────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.PillarAlignment.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.PillarAlignment.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, report: restored });
    }

    // ── SAVE ──────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html, pillar_data } = body;
      const all = await base44.asServiceRole.entities.PillarAlignment.list('-version_number', 1);
      const current = all[0];
      if (current) {
        await base44.asServiceRole.entities.PillarAlignment.update(current.id, {
          content_html, pillar_data, generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      const created = await base44.asServiceRole.entities.PillarAlignment.create({
        version_number: 1, title: "Write Vibe Pillar Alignment Report",
        content_html, pillar_data, generated_at: new Date().toISOString(), is_current: true
      });
      return Response.json({ success: true, id: created.id });
    }

    // ── REGENERATE SINGLE PILLAR ──────────────────────────────────────────────
    if (action === 'regenerate_pillar') {
      const { pillar } = body;
      if (!pillar) return Response.json({ error: 'pillar required' }, { status: 400 });

      const prompt = `You are an investor relations expert for "The Write Vibe" — an AI-powered self-publishing platform.

Rewrite the pillar alignment analysis for the "${pillar.name}" pillar with sharper investor language.

Platform context:
- ${PLATFORM_SNAPSHOT.aiAgents.length} AI agents, ${PLATFORM_SNAPSHOT.aiTools.length} AI tools, ${PLATFORM_SNAPSHOT.integrations.length} integrations
- Documents: ${PLATFORM_SNAPSHOT.foundationalDocuments.map(d => d.name).join(', ')}

Return a JSON object:
- definition: 2-sentence definition of this pillar in self-publishing context
- platform_elements: array of 4-8 specific platform elements (tools, agents, pages) serving this pillar
- alignment_score: number 1-10
- gaps: 2-3 sentences on current strategic gaps
- roadmap: 2-3 sentences on path to full alignment
- investor_insight: 2-sentence competitive advantage statement`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            definition: { type: "string" },
            platform_elements: { type: "array", items: { type: "string" } },
            alignment_score: { type: "number" },
            gaps: { type: "string" },
            roadmap: { type: "string" },
            investor_insight: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, updated_pillar: { ...pillar, ...result } });
    }

    // ── GENERATE FULL REPORT ─────────────────────────────────────────────────
    if (action === 'generate') {
      // Pull live mission statement if available
      const missionAll = await base44.asServiceRole.entities.MissionStatement.list('-version_number', 1);
      const mission = missionAll.find(m => m.is_current) || missionAll[0];
      const missionText = mission?.text || 'Empowering authors to create, publish, and market their stories with AI.';

      const docList = PLATFORM_SNAPSHOT.foundationalDocuments.map(d => `  • ${d.name} (${d.status})`).join('\n');

      const prompt = `You are a senior strategy consultant and investor relations expert for "The Write Vibe" — a full-stack AI-powered self-publishing platform.

PLATFORM MISSION: "${missionText}"

PLATFORM SCALE:
- ${PLATFORM_SNAPSHOT.pages.length} pages/views
- ${PLATFORM_SNAPSHOT.aiAgents.length} specialized AI agents: ${PLATFORM_SNAPSHOT.aiAgents.join(', ')}
- ${PLATFORM_SNAPSHOT.aiTools.length} AI tools: ${PLATFORM_SNAPSHOT.aiTools.join(', ')}
- ${PLATFORM_SNAPSHOT.integrations.length} integrations: ${PLATFORM_SNAPSHOT.integrations.join(', ')}
- Foundational documents:
${docList}

THE 8 BRAND PILLARS (in self-publishing context):
Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth

Generate a complete Pillar Alignment Report as structured JSON.

For EACH of the 8 pillars produce:
- pillar: pillar name (exact string from above)
- definition: 2-3 sentence definition of this pillar specifically in the context of self-publishing and author empowerment — not generic
- platform_elements: array of 5-10 specific platform elements, tools, agents, or features from the platform data above that serve this pillar
- alignment_score: integer 1-10 reflecting current depth of implementation
- gaps: 2-3 sentences identifying genuine gaps or underserved aspects of this pillar in the current platform
- roadmap: 2-3 sentences on specific features or capabilities that would advance this pillar to full alignment
- investor_insight: 2-3 sentences explaining why this pillar creates competitive moat, differentiation, or defensibility in the self-publishing market

Then produce:
- overall_score: weighted average of all pillar scores (number)
- executive_summary: 3-4 sentences summarizing the platform's overall pillar health, strongest areas, and strategic direction for investor consumption
- top_priorities: array of exactly 5 strings — the highest-leverage strategic actions to improve pillar alignment

Write with the authority and precision of a Series A pitch deck. Be specific, not generic.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: "object",
          properties: {
            pillars: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pillar: { type: "string" },
                  definition: { type: "string" },
                  platform_elements: { type: "array", items: { type: "string" } },
                  alignment_score: { type: "number" },
                  gaps: { type: "string" },
                  roadmap: { type: "string" },
                  investor_insight: { type: "string" }
                }
              }
            },
            overall_score: { type: "number" },
            executive_summary: { type: "string" },
            top_priorities: { type: "array", items: { type: "string" } }
          }
        }
      });

      const pillarColors = Object.fromEntries(PILLARS.map(p => [p.name, p.color]));
      const pillar_data = (result.pillars || []).map(p => ({ ...p, color: pillarColors[p.pillar] || '#64748b' }));
      const html = buildReportHTML({ pillar_data, overall_score: result.overall_score, executive_summary: result.executive_summary, top_priorities: result.top_priorities, missionText });

      // Save as new version
      const allVersions = await base44.asServiceRole.entities.PillarAlignment.list('-version_number', 50);
      const latestVersion = allVersions[0]?.version_number || 0;
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.PillarAlignment.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.PillarAlignment.create({
        version_number: latestVersion + 1,
        title: "Write Vibe Pillar Alignment Report",
        content_html: html,
        pillar_data,
        overall_score: result.overall_score,
        executive_summary: result.executive_summary,
        top_priorities: result.top_priorities,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Generated ${new Date().toLocaleDateString()} · ${pillar_data.length} pillars analyzed`
      });

      return Response.json({ success: true, report: saved });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function scoreBar(score) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : score >= 4 ? '#f97316' : '#ef4444';
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
    <div style="flex:1;height:8px;background:rgba(255,255,255,0.07);border-radius:4px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s;"></div>
    </div>
    <span style="font-family:sans-serif;font-size:13px;font-weight:700;color:${color};min-width:28px;">${score}/10</span>
  </div>`;
}

function buildReportHTML({ pillar_data, overall_score, executive_summary, top_priorities, missionText }) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const scoreColor = overall_score >= 8 ? '#22c55e' : overall_score >= 6 ? '#f59e0b' : '#f97316';

  return `<div style="font-family:'Georgia',serif;max-width:900px;margin:0 auto;color:#e2e8f0;line-height:1.75;">

  <!-- Header -->
  <div style="text-align:center;padding:48px 0 36px;border-bottom:2px solid rgba(245,158,11,0.35);margin-bottom:48px;">
    <p style="color:#f59e0b;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 14px;font-family:sans-serif;">Confidential · Investor & Agent Review</p>
    <h1 style="font-size:34px;font-weight:700;color:#ffffff;margin:0 0 6px;">The Write Vibe</h1>
    <h2 style="font-size:22px;font-weight:400;color:#94a3b8;margin:0 0 18px;">Pillar Alignment Report</h2>
    <p style="color:#475569;font-size:13px;font-family:sans-serif;">Generated ${now} · 8 Foundational Pillars Analyzed</p>
  </div>

  <!-- Mission -->
  <div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.18);border-radius:12px;padding:24px 28px;margin-bottom:36px;">
    <h3 style="color:#f59e0b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;font-family:sans-serif;">Platform Mission</h3>
    <p style="color:#cbd5e1;font-size:15px;font-style:italic;margin:0;">"${missionText}"</p>
  </div>

  <!-- Overall Score -->
  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:48px;text-align:center;">
    <p style="color:#64748b;font-family:sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Overall Pillar Alignment Score</p>
    <div style="font-size:64px;font-weight:700;color:${scoreColor};line-height:1;margin-bottom:8px;">${overall_score}<span style="font-size:28px;color:#475569;">/10</span></div>
    <div style="width:200px;height:10px;background:rgba(255,255,255,0.07);border-radius:5px;overflow:hidden;margin:12px auto 0;">
      <div style="width:${Math.round((overall_score/10)*100)}%;height:100%;background:${scoreColor};border-radius:5px;"></div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div style="margin-bottom:52px;">
    <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">Executive Summary</h2>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.8;margin:0;">${executive_summary}</p>
  </div>

  <!-- Pillar Scorecard -->
  <div style="margin-bottom:52px;">
    <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 20px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">Pillar Scorecard</h2>
    <div style="display:grid;gap:10px;">
      ${pillar_data.map(p => `
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-left:4px solid ${p.color};border-radius:0 10px 10px 0;padding:14px 20px;">
        <div style="width:140px;flex-shrink:0;font-weight:600;color:#f1f5f9;font-size:14px;">${p.pillar}</div>
        <div style="flex:1;">${scoreBar(p.alignment_score)}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Per-Pillar Deep Dive -->
  <div style="margin-bottom:52px;">
    <h2 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 32px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.07);">Pillar-by-Pillar Analysis</h2>
    ${pillar_data.map((p, i) => `
    <div style="margin-bottom:44px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-top:3px solid ${p.color};border-radius:0 0 16px 16px;padding:28px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
        <div>
          <div style="color:${p.color};font-family:sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Pillar ${String(i+1).padStart(2,'0')}</div>
          <h3 style="font-size:22px;font-weight:700;color:#ffffff;margin:0;">${p.pillar}</h3>
        </div>
        <div style="text-align:right;">
          <div style="font-size:28px;font-weight:700;color:${p.color};">${p.alignment_score}<span style="font-size:14px;color:#475569;">/10</span></div>
          <div style="font-family:sans-serif;font-size:11px;color:#475569;">Alignment Score</div>
        </div>
      </div>
      ${scoreBar(p.alignment_score)}

      <div style="margin-top:20px;">
        <h4 style="font-family:sans-serif;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Definition in Self-Publishing Context</h4>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;line-height:1.7;font-style:italic;">${p.definition}</p>
      </div>

      <div style="margin-bottom:20px;">
        <h4 style="font-family:sans-serif;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Platform Elements Serving This Pillar</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${(p.platform_elements || []).map(el => `<span style="background:${p.color}14;border:1px solid ${p.color}33;color:${p.color};font-family:sans-serif;font-size:12px;padding:4px 12px;border-radius:20px;">${el}</span>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:16px;">
          <h4 style="font-family:sans-serif;font-size:11px;color:#ef4444;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Strategic Gaps</h4>
          <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">${p.gaps}</p>
        </div>
        <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:16px;">
          <h4 style="font-family:sans-serif;font-size:11px;color:#22c55e;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Roadmap to Full Alignment</h4>
          <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">${p.roadmap}</p>
        </div>
      </div>

      <div style="background:${p.color}08;border-left:4px solid ${p.color}66;border-radius:0 10px 10px 0;padding:16px 20px;">
        <h4 style="font-family:sans-serif;font-size:11px;color:${p.color};text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Investor Insight · Competitive Advantage</h4>
        <p style="color:#cbd5e1;font-size:14px;font-style:italic;margin:0;line-height:1.6;">${p.investor_insight}</p>
      </div>
    </div>`).join('')}
  </div>

  <!-- Top Strategic Priorities -->
  <div style="margin-bottom:52px;">
    <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 20px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">Top Strategic Priorities</h2>
    <div style="display:grid;gap:12px;">
      ${(top_priorities || []).map((p, i) => `
      <div style="display:flex;align-items:flex-start;gap:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 22px;">
        <div style="width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700;color:#f59e0b;font-family:sans-serif;font-size:13px;">${i+1}</div>
        <p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.6;padding-top:4px;">${p}</p>
      </div>`).join('')}
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:32px 0;border-top:1px solid rgba(255,255,255,0.06);margin-top:40px;">
    <p style="color:#334155;font-size:12px;font-family:sans-serif;">© The Write Vibe · Confidential · Pillar Alignment Report · ${new Date().getFullYear()}</p>
  </div>
</div>`;
}