import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLATFORM_DATA = {
  pages: [
    "Landing", "Dashboard", "Books", "BookEditor", "CreateBook", "Documents",
    "Team", "Settings", "Pricing", "About", "Contact", "FAQ", "HowItWorks",
    "Privacy", "Terms", "CookiePolicy", "BookWebsite", "Investor", "UserManagement",
    "ErrorDashboard", "AgentMemoryLog", "MissionStatement", "SOPs", "MasterRegistry", "ProjectReports"
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
    "AI Outline Generator (Table of Contents)", "AI Detailed Outline", "AI Industry Outline",
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
  automations: [
    "Error logging (entity trigger)", "Agent memory persistence", "Review date notifications",
    "Owner notification on SOP review", "Mission statement alignment analysis",
    "Project report generation", "Media production monitoring"
  ],
  documents: [
    "Mission Statement (versioned, AI-analyzed)", "Standard Operating Procedures (SOP Library)",
    "Master Element Registry", "Project Reports", "Agent Memory Log",
    "Privacy Policy", "Terms of Service", "Cookie Policy",
    "White Papers", "Press Releases", "Publisher Letters", "Promotional Materials"
  ],
  pillars: [
    "Authenticity", "Creativity", "Empowerment", "Innovation",
    "Community", "Excellence", "Integrity", "Growth"
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

    // ── GET CURRENT ─────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, registry: current });
    }

    // ── GET VERSIONS ────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes
      }))});
    }

    // ── RESTORE VERSION ──────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.MasterRegistry.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, registry: restored });
    }

    // ── SAVE (auto-save or manual) ────────────────────────────────────────────
    if (action === 'save') {
      const { content_html, elements, generation_notes } = body;
      const all = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 1);
      const current = all[0];
      
      if (current) {
        // Update existing current
        await base44.asServiceRole.entities.MasterRegistry.update(current.id, {
          content_html, elements, generation_notes,
          generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      // No registry yet — create first
      const created = await base44.asServiceRole.entities.MasterRegistry.create({
        version_number: 1, title: "Write Vibe Master Element Registry",
        content_html, elements, generated_at: new Date().toISOString(),
        is_current: true, generation_notes
      });
      return Response.json({ success: true, id: created.id });
    }

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const { sops = [], mission = null } = body;

      const sopList = sops.map(s => `- ${s.title} (v${s.version}, ${s.status}): ${s.purpose || ''}`).join('\n');
      const missionText = mission?.text || 'Empowering authors to create, publish, and market their stories with AI.';

      const prompt = `You are a senior technology strategist and investor relations expert. 
Your task: generate a complete, professional Master Element Registry for "The Write Vibe" — an AI-powered book creation, publishing, and marketing platform.

PLATFORM MISSION: "${missionText}"

BRAND PILLARS: ${PLATFORM_DATA.pillars.join(', ')}

PLATFORM DATA TO ANALYZE AND DOCUMENT:

PAGES (${PLATFORM_DATA.pages.length}):
${PLATFORM_DATA.pages.join(', ')}

AI AGENTS (${PLATFORM_DATA.aiAgents.length}):
${PLATFORM_DATA.aiAgents.join(', ')}

AI TOOLS & FEATURES (${PLATFORM_DATA.aiTools.length}):
${PLATFORM_DATA.aiTools.join(', ')}

DISTRIBUTION INTEGRATIONS (${PLATFORM_DATA.integrations.length}):
${PLATFORM_DATA.integrations.join(', ')}

AUTOMATIONS (${PLATFORM_DATA.automations.length}):
${PLATFORM_DATA.automations.join(', ')}

FOUNDATIONAL DOCUMENTS (${PLATFORM_DATA.documents.length}):
${PLATFORM_DATA.documents.join(', ')}

STANDARD OPERATING PROCEDURES:
${sopList || 'None recorded yet.'}

Generate a Master Element Registry as a structured JSON array. For EACH element above, produce:
- id: unique slug (e.g. "page-dashboard")
- name: element name
- category: one of "Page", "AI Tool", "AI Agent", "Integration", "Automation", "Document", "Process"
- pillar_alignment: array of relevant brand pillars from [${PLATFORM_DATA.pillars.join(', ')}]
- purpose: 1-2 sentences in professional investor language explaining business purpose
- inputs: what data/inputs this element consumes
- outputs: what it produces or enables
- dependencies: key technical or content dependencies
- status: one of "Active", "In Development", "Planned"
- strategic_value: 1 sentence on competitive or strategic significance

Group elements logically. Write in the voice of a Series A pitch deck.

Return ONLY valid JSON: an array of element objects. No markdown, no explanation.`;

      const elements = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: "object",
          properties: {
            elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  category: { type: "string" },
                  pillar_alignment: { type: "array", items: { type: "string" } },
                  purpose: { type: "string" },
                  inputs: { type: "string" },
                  outputs: { type: "string" },
                  dependencies: { type: "string" },
                  status: { type: "string" },
                  strategic_value: { type: "string" }
                }
              }
            }
          }
        }
      });

      const elementList = elements?.elements || [];

      // Build HTML document
      const categories = [...new Set(elementList.map(e => e.category))];
      const statusColor = { Active: '#22c55e', 'In Development': '#f59e0b', Planned: '#64748b' };

      const html = `<div style="font-family: 'Georgia', serif; max-width: 900px; margin: 0 auto; color: #e2e8f0; line-height: 1.7;">
  <div style="text-align: center; padding: 40px 0 32px; border-bottom: 2px solid rgba(245,158,11,0.4); margin-bottom: 40px;">
    <p style="color: #f59e0b; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px;">Confidential · Investor & Agent Review</p>
    <h1 style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">The Write Vibe</h1>
    <h2 style="font-size: 20px; font-weight: 400; color: #94a3b8; margin: 0 0 16px;">Master Element Registry</h2>
    <p style="color: #64748b; font-size: 13px;">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${elementList.length} Platform Elements Documented</p>
  </div>

  <div style="background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 24px; margin-bottom: 40px;">
    <h3 style="color: #f59e0b; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px;">Platform Mission</h3>
    <p style="color: #cbd5e1; font-size: 16px; font-style: italic; margin: 0;">"${missionText}"</p>
  </div>

  <div style="margin-bottom: 40px;">
    <h3 style="color: #f59e0b; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 14px;">Brand Pillars</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      ${PLATFORM_DATA.pillars.map(p => `<span style="background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #fbbf24; font-size: 12px; padding: 4px 12px; border-radius: 20px;">${p}</span>`).join('')}
    </div>
  </div>

  ${categories.map(cat => {
    const items = elementList.filter(e => e.category === cat);
    return `<div style="margin-bottom: 48px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0;">${cat}s</h2>
      <span style="background: rgba(255,255,255,0.06); color: #94a3b8; font-size: 12px; padding: 2px 10px; border-radius: 12px;">${items.length} elements</span>
    </div>
    ${items.map(el => `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
        <h3 style="font-size: 17px; font-weight: 600; color: #f1f5f9; margin: 0;">${el.name}</h3>
        <span style="background: ${statusColor[el.status] || '#64748b'}22; border: 1px solid ${statusColor[el.status] || '#64748b'}55; color: ${statusColor[el.status] || '#94a3b8'}; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px; white-space: nowrap;">${el.status}</span>
      </div>
      ${el.pillar_alignment?.length ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">${el.pillar_alignment.map(p => `<span style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18); color: #d97706; font-size: 11px; padding: 2px 8px; border-radius: 10px;">${p}</span>`).join('')}</div>` : ''}
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 14px; line-height: 1.6;">${el.purpose}</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <div><p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Inputs</p><p style="color: #94a3b8; font-size: 13px; margin: 0;">${el.inputs || '—'}</p></div>
        <div><p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Outputs</p><p style="color: #94a3b8; font-size: 13px; margin: 0;">${el.outputs || '—'}</p></div>
      </div>
      ${el.dependencies ? `<div style="margin-bottom: 14px;"><p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Dependencies</p><p style="color: #94a3b8; font-size: 13px; margin: 0;">${el.dependencies}</p></div>` : ''}
      <div style="background: rgba(245,158,11,0.06); border-left: 3px solid rgba(245,158,11,0.4); padding: 10px 14px; border-radius: 0 8px 8px 0;">
        <p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Strategic Value</p>
        <p style="color: #fbbf24; font-size: 13px; font-style: italic; margin: 0;">${el.strategic_value}</p>
      </div>
    </div>`).join('')}
  </div>`;
  }).join('')}

  <div style="text-align: center; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 40px;">
    <p style="color: #334155; font-size: 12px;">© The Write Vibe · Confidential · Master Element Registry · ${new Date().getFullYear()}</p>
  </div>
</div>`;

      // Save as new version
      const allVersions = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 1);
      const latestVersion = allVersions[0]?.version_number || 0;

      // Mark all old as not current
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.MasterRegistry.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.MasterRegistry.create({
        version_number: latestVersion + 1,
        title: "Write Vibe Master Element Registry",
        content_html: html,
        elements: elementList,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Auto-generated from ${elementList.length} platform elements`
      });

      return Response.json({ success: true, registry: saved, element_count: elementList.length });
    }

    // ── REGENERATE ELEMENT ────────────────────────────────────────────────────
    if (action === 'regenerate_element') {
      const { element } = body;
      if (!element) return Response.json({ error: 'element required' }, { status: 400 });

      const prompt = `You are an investor relations expert for The Write Vibe AI publishing platform.
Rewrite the following platform element registry entry with stronger, more compelling investor language.

Element: ${element.name}
Category: ${element.category}
Current purpose: ${element.purpose}

Return a JSON object with these fields:
- purpose: compelling 1-2 sentence investor-facing purpose statement
- inputs: what data/triggers this element needs
- outputs: what value it produces
- dependencies: technical or content dependencies
- status: one of "Active", "In Development", "Planned"
- strategic_value: one punchy sentence on competitive advantage`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            purpose: { type: "string" },
            inputs: { type: "string" },
            outputs: { type: "string" },
            dependencies: { type: "string" },
            status: { type: "string" },
            strategic_value: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, updated_element: { ...element, ...result } });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});