import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILLARS = [
  { name: "Authenticity",  color: "#f59e0b", hex: "#f59e0b" },
  { name: "Creativity",    color: "#8b5cf6", hex: "#8b5cf6" },
  { name: "Empowerment",   color: "#10b981", hex: "#10b981" },
  { name: "Innovation",    color: "#3b82f6", hex: "#3b82f6" },
  { name: "Community",     color: "#f97316", hex: "#f97316" },
  { name: "Excellence",    color: "#ec4899", hex: "#ec4899" },
  { name: "Integrity",     color: "#06b6d4", hex: "#06b6d4" },
  { name: "Growth",        color: "#84cc16", hex: "#84cc16" }
];

const ELEMENT_CATEGORIES = [
  "Page", "AI Tool", "AI Agent", "Integration", "Automation", "Document", "Process"
];

const RELATIONSHIP_TYPES = [
  "triggers", "feeds_into", "depends_on", "produces", "monitors", "manages", "integrates_with", "extends"
];

const STATUS_TYPES = [
  "Active", "In Development", "Planned", "Draft", "Under Review", "Archived", "Published"
];

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
      const all = await base44.asServiceRole.entities.MapLegend.list('-version_number', 50);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, legend: current });
    }

    // ── GET VERSIONS ────────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.MapLegend.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes
      }))});
    }

    // ── RESTORE ──────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.MapLegend.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.MapLegend.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, legend: restored });
    }

    // ── SAVE ─────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html, legend_data } = body;
      const all = await base44.asServiceRole.entities.MapLegend.list('-version_number', 1);
      const current = all[0];
      if (current) {
        await base44.asServiceRole.entities.MapLegend.update(current.id, {
          content_html, legend_data, generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      const created = await base44.asServiceRole.entities.MapLegend.create({
        version_number: 1, title: "Write Vibe Map Legend",
        content_html, legend_data, generated_at: new Date().toISOString(), is_current: true
      });
      return Response.json({ success: true, id: created.id });
    }

    // ── GENERATE ─────────────────────────────────────────────────────────────
    if (action === 'generate') {
      // Optionally pull live registry elements for context
      const registryAll = await base44.asServiceRole.entities.MasterRegistry.list('-version_number', 1);
      const registry = registryAll.find(r => r.is_current) || registryAll[0];
      const elements = registry?.elements || [];
      const categoryCounts = {};
      elements.forEach(e => { categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1; });

      const prompt = `You are a senior platform architect and investor relations expert for "The Write Vibe" — an AI-powered book creation and publishing platform.

Generate a complete Map Legend — a professional visual language reference document for investors and agents reviewing platform architecture.

PLATFORM DATA:

8 BRAND PILLARS WITH ASSIGNED COLORS:
${PILLARS.map(p => `- ${p.name}: ${p.color}`).join('\n')}

ELEMENT CATEGORIES IN THE SYSTEM:
${ELEMENT_CATEGORIES.join(', ')}
${Object.entries(categoryCounts).map(([k, v]) => `  • ${k}: ${v} elements`).join('\n')}

RELATIONSHIP TYPES USED:
${RELATIONSHIP_TYPES.join(', ')}

STATUS TYPES ACROSS THE PLATFORM:
${STATUS_TYPES.join(', ')}

Generate the following sections as JSON:

1. element_types: For each element category, provide:
   - category (string)
   - symbol (a single emoji or ASCII shape that would represent it in a diagram)
   - shape (rectangle, diamond, cylinder, oval, hexagon, rounded-rectangle, parallelogram)
   - border_color (hex)
   - fill_color (hex, dark variant)
   - description: 1 sentence definition
   - example_count (number, use the data above)
   - mermaid_style: a valid Mermaid CSS style string for this node type

2. relationship_types: For each relationship, provide:
   - type (string, the key)
   - label: human-readable label
   - arrow_style: one of "solid", "dashed", "dotted"
   - arrow_head: one of "arrow", "circle", "diamond", "none"
   - color (hex)
   - description: 1 sentence explanation
   - mermaid_notation: e.g. "-->", "-.->" etc.
   - example: a concrete example like "ManuscriptWriter --> AIEditorPanel"

3. status_indicators: For each status, provide:
   - status (string)
   - color (hex — use: Active=#22c55e, In Development=#f59e0b, Planned=#64748b, Draft=#94a3b8, Under Review=#a78bfa, Archived=#475569, Published=#34d399)
   - badge_style: "solid" or "outline"
   - description: 1 sentence
   - applies_to: array of element categories this status applies to

4. pillar_colors: For each pillar, provide:
   - pillar (string)
   - color (hex — use the exact colors listed above)
   - complementary_color (hex — a lighter tint for backgrounds)
   - description: 1 sentence on what this pillar represents in platform terms
   - primary_elements: array of 2-3 element names most aligned

5. hierarchy_levels: Define the platform hierarchy levels:
   - level (number 1-5)
   - name (e.g. "Core Infrastructure", "Intelligence Layer", "User Interface", "Distribution", "Governance")
   - description: 1 sentence
   - color (hex)
   - elements_in_layer: array of 2-3 representative element names

Write in precise, investor-ready language. Be specific and authoritative.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: "object",
          properties: {
            element_types: { type: "array", items: { type: "object" } },
            relationship_types: { type: "array", items: { type: "object" } },
            status_indicators: { type: "array", items: { type: "object" } },
            pillar_colors: { type: "array", items: { type: "object" } },
            hierarchy_levels: { type: "array", items: { type: "object" } }
          }
        }
      });

      const legend_data = result;
      const html = buildLegendHTML(legend_data);

      // Save as new version
      const allVersions = await base44.asServiceRole.entities.MapLegend.list('-version_number', 50);
      const latestVersion = allVersions[0]?.version_number || 0;
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.MapLegend.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.MapLegend.create({
        version_number: latestVersion + 1,
        title: "Write Vibe Map Legend",
        content_html: html,
        legend_data,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Generated from live platform data · ${new Date().toLocaleDateString()}`
      });

      return Response.json({ success: true, legend: saved });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildLegendHTML(data) {
  const { element_types = [], relationship_types = [], status_indicators = [], pillar_colors = [], hierarchy_levels = [] } = data;
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<div style="font-family: 'Georgia', serif; max-width: 900px; margin: 0 auto; color: #e2e8f0; line-height: 1.75;">

  <!-- Header -->
  <div style="text-align: center; padding: 48px 0 36px; border-bottom: 2px solid rgba(245,158,11,0.35); margin-bottom: 48px;">
    <p style="color: #f59e0b; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 14px; font-family: sans-serif;">Confidential · Investor & Agent Reference</p>
    <h1 style="font-size: 34px; font-weight: 700; color: #ffffff; margin: 0 0 6px;">The Write Vibe</h1>
    <h2 style="font-size: 22px; font-weight: 400; color: #94a3b8; margin: 0 0 18px;">Platform Map Legend</h2>
    <p style="color: #475569; font-size: 13px; font-family: sans-serif;">Generated ${now} · Visual Language Reference for System Architecture Review</p>
  </div>

  <!-- Intro -->
  <div style="background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.18); border-radius: 12px; padding: 24px 28px; margin-bottom: 48px;">
    <h3 style="color: #f59e0b; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px; font-family: sans-serif;">About This Document</h3>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0;">This Map Legend defines the complete visual language of The Write Vibe platform architecture. It standardizes how elements, relationships, statuses, and brand pillars are represented across all system diagrams, investor presentations, and agent-facing documentation.</p>
  </div>

  <!-- Section 1: Element Types -->
  <div style="margin-bottom: 52px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);">
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">01 · Element Type Definitions</h2>
    </div>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family: sans-serif;">Each node category in the platform system map uses a distinct shape and color to communicate its architectural role at a glance.</p>
    <div style="display: grid; gap: 14px;">
      ${element_types.map(et => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid ${et.border_color || '#64748b'}; border-radius: 0 12px 12px 0; padding: 20px 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 22px;">${et.symbol || '□'}</span>
            <div>
              <span style="font-size: 16px; font-weight: 600; color: #f1f5f9;">${et.category}</span>
              <span style="font-family: sans-serif; font-size: 11px; color: #475569; margin-left: 10px;">Shape: ${et.shape || 'rectangle'}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: ${et.fill_color || '#1e293b'}; border: 1px solid ${et.border_color || '#475569'}; color: ${et.border_color || '#94a3b8'}; font-family: sans-serif; font-size: 11px; padding: 3px 10px; border-radius: 20px;">${et.example_count || ''} elements</span>
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px;">${et.description || ''}</p>
        ${et.mermaid_style ? `<code style="font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.3); color: #7dd3fc; padding: 4px 10px; border-radius: 6px; display: inline-block;">${et.mermaid_style}</code>` : ''}
      </div>`).join('')}
    </div>
  </div>

  <!-- Section 2: Relationship Types -->
  <div style="margin-bottom: 52px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);">
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">02 · Relationship Type Descriptions</h2>
    </div>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family: sans-serif;">Edges in the platform diagram represent different types of relationships between elements, each with a unique visual encoding.</p>
    <div style="display: grid; gap: 14px;">
      ${relationship_types.map(rt => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 3px; background: ${rt.color || '#64748b'}; border-radius: 2px; ${rt.arrow_style === 'dashed' ? 'border-top: 2px dashed ' + (rt.color || '#64748b') + '; background: transparent;' : ''}"></div>
            <span style="font-size: 15px; font-weight: 600; color: #f1f5f9;">${rt.label || rt.type}</span>
            <code style="font-family: monospace; font-size: 12px; color: #7dd3fc; background: rgba(125,211,252,0.08); padding: 2px 8px; border-radius: 4px;">${rt.mermaid_notation || '-->'}</code>
          </div>
          <span style="font-family: sans-serif; font-size: 11px; color: ${rt.color || '#94a3b8'}; background: ${rt.color || '#64748b'}18; border: 1px solid ${rt.color || '#64748b'}33; padding: 3px 10px; border-radius: 20px;">${rt.arrow_style || 'solid'} · ${rt.arrow_head || 'arrow'}</span>
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">${rt.description || ''}</p>
        ${rt.example ? `<p style="color: #475569; font-size: 12px; font-family: sans-serif; margin: 0;"><strong style="color: #64748b;">Example:</strong> <code style="color: #a78bfa;">${rt.example}</code></p>` : ''}
      </div>`).join('')}
    </div>
  </div>

  <!-- Section 3: Status Indicators -->
  <div style="margin-bottom: 52px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);">
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">03 · Status Indicator Definitions</h2>
    </div>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family: sans-serif;">Status badges appear on elements throughout the platform to communicate operational state at a glance.</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      ${status_indicators.map(si => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${si.color || '#64748b'};"></div>
          <span style="background: ${si.color || '#64748b'}22; border: 1px solid ${si.color || '#64748b'}55; color: ${si.color || '#94a3b8'}; font-family: sans-serif; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 20px;">${si.status}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">${si.description || ''}</p>
        ${si.applies_to?.length ? `<p style="color: #475569; font-size: 11px; font-family: sans-serif; margin: 0;">Applies to: ${si.applies_to.join(', ')}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>

  <!-- Section 4: Pillar Color Assignments -->
  <div style="margin-bottom: 52px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);">
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">04 · Pillar Color Code Assignments</h2>
    </div>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family: sans-serif;">The Write Vibe's eight brand pillars are encoded with distinct colors that propagate through all architecture diagrams, tagging elements with their philosophical alignment.</p>
    <div style="display: grid; gap: 14px;">
      ${pillar_colors.map(pc => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-left: 5px solid ${pc.color || '#64748b'}; border-radius: 0 12px 12px 0; padding: 20px 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${pc.color || '#64748b'};"></div>
            <div>
              <span style="font-size: 16px; font-weight: 600; color: #f1f5f9;">${pc.pillar}</span>
              <div style="font-family: monospace; font-size: 12px; color: #475569; margin-top: 2px;">${pc.color || '—'} · tint: ${pc.complementary_color || '—'}</div>
            </div>
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">${pc.description || ''}</p>
        ${pc.primary_elements?.length ? `<div style="display: flex; flex-wrap: wrap; gap: 6px;">${pc.primary_elements.map(e => `<span style="background: ${pc.color || '#64748b'}14; border: 1px solid ${pc.color || '#64748b'}30; color: ${pc.color || '#94a3b8'}; font-size: 11px; font-family: sans-serif; padding: 2px 10px; border-radius: 12px;">${e}</span>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>

  <!-- Section 5: Hierarchy Levels -->
  <div style="margin-bottom: 52px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);">
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">05 · Hierarchy Level Descriptions</h2>
    </div>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; font-family: sans-serif;">The platform architecture is organized into five hierarchical layers, each representing a distinct level of abstraction and operational concern.</p>
    <div style="display: grid; gap: 14px;">
      ${hierarchy_levels.map(hl => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px; display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: ${hl.color || '#1e293b'}22; border: 2px solid ${hl.color || '#475569'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 20px; font-weight: 700; color: ${hl.color || '#94a3b8'};">L${hl.level}</span>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #f1f5f9; margin: 0 0 6px;">${hl.name}</h3>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px;">${hl.description || ''}</p>
          ${hl.elements_in_layer?.length ? `<div style="display: flex; flex-wrap: wrap; gap: 6px;">${hl.elements_in_layer.map(e => `<span style="background: ${hl.color || '#64748b'}14; border: 1px solid ${hl.color || '#64748b'}30; color: ${hl.color || '#94a3b8'}; font-size: 11px; font-family: sans-serif; padding: 2px 10px; border-radius: 12px;">${e}</span>`).join('')}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 40px;">
    <p style="color: #334155; font-size: 12px; font-family: sans-serif;">© The Write Vibe · Confidential · Platform Map Legend · ${new Date().getFullYear()}</p>
  </div>
</div>`;
}