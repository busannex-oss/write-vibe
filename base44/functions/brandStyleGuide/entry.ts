import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BRAND_CONTEXT = {
  name: "The Write Vibe",
  tagline: "Where Authors Find Their Voice",
  market: "AI-powered self-publishing platform for independent authors",
  audience: "Aspiring and professional authors, indie publishers, literary agents, book investors",
  pillars: ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"],
  currentColors: {
    primary: "#f59e0b",   // amber-500
    secondary: "#ea580c", // orange-600
    dark: "#0f172a",      // slate-950
    surface: "#1e293b",   // slate-800
    text: "#f1f5f9"       // slate-100
  },
  currentTypography: "Georgia (serif) for headings, system sans-serif for body",
  competitors: ["Reedsy", "Draft2Digital", "Atticus", "Scrivener"],
  uniqueValue: "End-to-end AI studio: write, design, publish, market — all in one platform"
};

function buildGuideHTML(data, missionText) {
  const { identity, colors, typography, spacing, components, applications } = data;

  const colorSwatches = colors.map(c => `
    <div style="display:inline-block; margin: 0 12px 16px 0; text-align:center; vertical-align:top; width:120px;">
      <div style="width:120px; height:80px; border-radius:12px; background:${c.hex}; border:1px solid rgba(255,255,255,0.1); margin-bottom:8px;"></div>
      <p style="color:#f1f5f9; font-size:13px; font-weight:600; margin:0 0 2px;">${c.name}</p>
      <p style="color:#94a3b8; font-size:11px; font-family:monospace; margin:0 0 4px;">${c.hex}</p>
      <p style="color:#64748b; font-size:11px; margin:0;">${c.usage}</p>
    </div>`).join('');

  const typographyRows = (typography.scale || []).map(t => `
    <div style="padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
      <p style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 6px;">${t.name} · ${t.size} · ${t.weight}</p>
      <p style="color:#f1f5f9; font-family:${t.font_family || 'Georgia, serif'}; font-size:${t.size}; font-weight:${t.weight}; margin:0; line-height:1.3;">${t.example}</p>
    </div>`).join('');

  const componentCards = (components || []).map(comp => `
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:14px;">
      <h4 style="color:#fbbf24; font-size:14px; font-weight:700; margin:0 0 6px;">${comp.name}</h4>
      <p style="color:#94a3b8; font-size:13px; margin:0 0 8px;">${comp.description}</p>
      <p style="color:#64748b; font-size:12px; font-style:italic; margin:0;">Usage: ${comp.usage}</p>
    </div>`).join('');

  const appRows = (applications || []).map(a => `
    <div style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.15); border-radius:10px; padding:16px; margin-bottom:10px;">
      <p style="color:#fbbf24; font-size:13px; font-weight:600; margin:0 0 4px;">${a.context}</p>
      <p style="color:#94a3b8; font-size:13px; margin:0 0 6px;">${a.guidance}</p>
      <p style="color:#64748b; font-size:12px; font-style:italic; margin:0;">${a.example}</p>
    </div>`).join('');

  return `<div style="font-family:'Georgia',serif; max-width:900px; margin:0 auto; color:#e2e8f0; line-height:1.7;">
  <!-- COVER -->
  <div style="text-align:center; padding:48px 0 40px; border-bottom:2px solid rgba(245,158,11,0.4); margin-bottom:48px;">
    <p style="color:#f59e0b; font-size:11px; letter-spacing:4px; text-transform:uppercase; margin-bottom:12px;">Confidential · Brand Identity Document</p>
    <h1 style="font-size:38px; font-weight:700; color:#ffffff; margin:0 0 8px;">${BRAND_CONTEXT.name}</h1>
    <h2 style="font-size:18px; font-weight:400; color:#94a3b8; font-style:italic; margin:0 0 20px;">"${BRAND_CONTEXT.tagline}"</h2>
    <p style="color:#64748b; font-size:13px;">Brand Style Guide · v${new Date().getFullYear()} · For Investors, Agents & Partners</p>
  </div>

  <!-- BRAND PROMISE -->
  <div style="background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.25); border-radius:16px; padding:32px; margin-bottom:48px; text-align:center;">
    <p style="color:#f59e0b; font-size:11px; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px;">Brand Promise</p>
    <p style="color:#ffffff; font-size:20px; font-style:italic; margin:0;">"${identity.brand_promise}"</p>
  </div>

  <!-- BRAND IDENTITY -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">01 · Brand Identity</h2>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
        <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Personality</p>
        <p style="color:#cbd5e1; font-size:14px; margin:0;">${identity.personality}</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
        <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Voice & Tone</p>
        <p style="color:#cbd5e1; font-size:14px; margin:0;">${identity.voice}</p>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:16px;">
      <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Positioning Statement</p>
      <p style="color:#cbd5e1; font-size:14px; margin:0;">${identity.positioning}</p>
    </div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
      <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Target Audience</p>
      <p style="color:#cbd5e1; font-size:14px; margin:0;">${identity.audience}</p>
    </div>
  </div>

  <!-- COLOR PALETTE -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">02 · Color Palette</h2>
    <div style="margin-bottom:16px;">${colorSwatches}</div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
      <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 10px;">Color Usage Rules</p>
      ${(colors.map(c => `<p style="color:#94a3b8; font-size:13px; margin:0 0 6px;"><span style="color:#fbbf24; font-weight:600;">${c.name} (${c.hex}):</span> ${c.do} Do NOT: ${c.dont}</p>`)).join('')}
    </div>
  </div>

  <!-- TYPOGRAPHY -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">03 · Typography Scale</h2>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px; margin-bottom:16px;">
      ${typographyRows}
    </div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
      <p style="color:#f59e0b; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Typography Rules</p>
      <p style="color:#94a3b8; font-size:13px; margin:0;">${typography.rules}</p>
    </div>
  </div>

  <!-- SPACING -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">04 · Spacing System</h2>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px;">
      <p style="color:#94a3b8; font-size:14px; margin:0 0 16px;">${spacing.philosophy}</p>
      <div style="display:flex; flex-wrap:wrap; gap:16px;">
        ${(spacing.scale || []).map(s => `<div style="text-align:center;"><div style="width:${s.px}; height:${s.px}; background:rgba(245,158,11,0.2); border:1px dashed rgba(245,158,11,0.4); border-radius:4px; margin:0 auto 6px;"></div><p style="color:#fbbf24; font-size:11px; margin:0;">${s.name}</p><p style="color:#64748b; font-size:11px; font-family:monospace; margin:0;">${s.value}</p></div>`).join('')}
      </div>
    </div>
  </div>

  <!-- COMPONENT STANDARDS -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">05 · Component Standards</h2>
    ${componentCards}
  </div>

  <!-- BRAND APPLICATIONS -->
  <div style="margin-bottom:48px;">
    <h2 style="font-size:22px; font-weight:700; color:#ffffff; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:24px;">06 · Brand Application Examples</h2>
    ${appRows}
  </div>

  <!-- FOOTER -->
  <div style="text-align:center; padding:32px 0; border-top:1px solid rgba(255,255,255,0.06); margin-top:40px;">
    <p style="color:#334155; font-size:12px;">© ${new Date().getFullYear()} The Write Vibe · Brand Style Guide · Confidential</p>
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

    // ── GET CURRENT ────────────────────────────────────────────────────────
    if (action === 'get_current') {
      const all = await base44.asServiceRole.entities.BrandStyleGuide.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0] || null;
      return Response.json({ success: true, guide: current });
    }

    // ── GET VERSIONS ───────────────────────────────────────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.BrandStyleGuide.list('-version_number', 50);
      return Response.json({ success: true, versions: all.map(r => ({
        id: r.id, version_number: r.version_number, generated_at: r.generated_at,
        is_current: r.is_current, generation_notes: r.generation_notes
      }))});
    }

    // ── RESTORE ────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.BrandStyleGuide.list('-version_number', 50);
      await Promise.all(all.map(r => base44.asServiceRole.entities.BrandStyleGuide.update(r.id, { is_current: r.id === id })));
      const restored = all.find(r => r.id === id);
      return Response.json({ success: true, guide: restored });
    }

    // ── SAVE ───────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { content_html, brand_data, generation_notes } = body;
      const all = await base44.asServiceRole.entities.BrandStyleGuide.list('-version_number', 1);
      const current = all.find(r => r.is_current) || all[0];
      if (current) {
        await base44.asServiceRole.entities.BrandStyleGuide.update(current.id, {
          content_html, brand_data, generation_notes, generated_at: new Date().toISOString()
        });
        return Response.json({ success: true, id: current.id });
      }
      const created = await base44.asServiceRole.entities.BrandStyleGuide.create({
        version_number: 1, title: "The Write Vibe Brand Style Guide",
        content_html, brand_data, generated_at: new Date().toISOString(), is_current: true, generation_notes
      });
      return Response.json({ success: true, id: created.id });
    }

    // ── GENERATE ───────────────────────────────────────────────────────────
    if (action === 'generate') {
      const missionAll = await base44.asServiceRole.entities.MissionStatement.list('-version_number', 1);
      const mission = missionAll.find(m => m.is_current) || missionAll[0];
      const missionText = mission?.text || 'Empowering authors to create, publish, and market their stories with AI.';

      const ctx = `
Platform: ${BRAND_CONTEXT.name} — ${BRAND_CONTEXT.market}
Tagline: "${BRAND_CONTEXT.tagline}"
Mission: "${missionText}"
Brand Pillars: ${BRAND_CONTEXT.pillars.join(', ')}
Current primary color: ${BRAND_CONTEXT.currentColors.primary} (amber)
Current dark background: ${BRAND_CONTEXT.currentColors.dark}
Audience: ${BRAND_CONTEXT.audience}
Differentiator: ${BRAND_CONTEXT.uniqueValue}
Competitors: ${BRAND_CONTEXT.competitors.join(', ')}
Typography: ${BRAND_CONTEXT.currentTypography}`;

      // Fire all sections in parallel
      const [identityRes, colorsRes, typographyRes, spacingRes, componentsRes, applicationsRes] = await Promise.all([
        // Identity
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a senior brand strategist. Generate brand identity JSON for this platform.\n${ctx}\n\nReturn JSON with: brand_promise (1 compelling sentence), personality (2-3 sentences on brand character), voice (2-3 sentences on tone), positioning (1-2 sentences), audience (1-2 sentences describing primary user segments). Write for a Series A pitch deck audience.`,
          response_json_schema: { type: "object", properties: { brand_promise: {type:"string"}, personality: {type:"string"}, voice: {type:"string"}, positioning: {type:"string"}, audience: {type:"string"} } }
        }),
        // Colors
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a brand color expert. Generate a professional color palette for:\n${ctx}\n\nReturn JSON with "colors" array of 6 colors. Each color: name, hex (must include amber #f59e0b as primary, dark navy #0f172a as background), role (primary/secondary/accent/background/surface/text), usage (1 sentence), do (what to use it for), dont (what to avoid). Keep existing amber+dark theme, extend thoughtfully.`,
          response_json_schema: { type: "object", properties: { colors: { type: "array", items: { type: "object", properties: { name:{type:"string"}, hex:{type:"string"}, role:{type:"string"}, usage:{type:"string"}, do:{type:"string"}, dont:{type:"string"} } } } } }
        }),
        // Typography
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a typography expert. Generate a typography system for:\n${ctx}\n\nReturn JSON with: scale (array of 6 type styles — H1 through Body Small — each with: name, size, weight, font_family, example text), rules (2-3 sentences on typography usage guidelines). Use Georgia for headings, system-ui/sans-serif for body.`,
          response_json_schema: { type: "object", properties: { scale: { type: "array", items: { type: "object", properties: { name:{type:"string"}, size:{type:"string"}, weight:{type:"string"}, font_family:{type:"string"}, example:{type:"string"} } } }, rules: {type:"string"} } }
        }),
        // Spacing
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a design systems expert. Generate a spacing system for:\n${ctx}\n\nReturn JSON with: philosophy (1-2 sentences), scale (array of 6 spacing tokens — each with: name like "xs/sm/md/lg/xl/2xl", value like "4px", px as CSS pixel string like "4px" for visual demo — keep values between 4px and 64px).`,
          response_json_schema: { type: "object", properties: { philosophy: {type:"string"}, scale: { type: "array", items: { type: "object", properties: { name:{type:"string"}, value:{type:"string"}, px:{type:"string"} } } } } }
        }),
        // Components
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a UI component standards expert. Define component standards for:\n${ctx}\n\nReturn JSON with "components" array of 6 UI component standards (e.g. Primary Button, Card, Input Field, Badge, Navigation, Modal). Each: name, description (visual style), usage (when to use).`,
          response_json_schema: { type: "object", properties: { components: { type: "array", items: { type: "object", properties: { name:{type:"string"}, description:{type:"string"}, usage:{type:"string"} } } } } }
        }),
        // Applications
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a brand application expert. Define brand application guidelines for:\n${ctx}\n\nReturn JSON with "applications" array of 6 real-world brand application contexts (e.g. Investor Pitch Deck, Social Media, Email Campaigns, In-App UI, Press Release, Partner Decks). Each: context, guidance (2 sentences), example (1 specific example).`,
          response_json_schema: { type: "object", properties: { applications: { type: "array", items: { type: "object", properties: { context:{type:"string"}, guidance:{type:"string"}, example:{type:"string"} } } } } }
        }),
      ]);

      const brand_data = {
        identity: identityRes,
        colors: colorsRes.colors || [],
        typography: typographyRes,
        spacing: spacingRes,
        components: componentsRes.components || [],
        applications: applicationsRes.applications || []
      };

      const content_html = buildGuideHTML(brand_data, missionText);

      const allVersions = await base44.asServiceRole.entities.BrandStyleGuide.list('-version_number', 50);
      const latestVersion = allVersions[0]?.version_number || 0;
      await Promise.all(allVersions.map(r => base44.asServiceRole.entities.BrandStyleGuide.update(r.id, { is_current: false })));

      const saved = await base44.asServiceRole.entities.BrandStyleGuide.create({
        version_number: latestVersion + 1,
        title: "The Write Vibe Brand Style Guide",
        content_html,
        brand_data,
        generated_at: new Date().toISOString(),
        is_current: true,
        generation_notes: `Generated ${new Date().toLocaleDateString()} · AI-composed brand identity`
      });

      return Response.json({ success: true, guide: saved });
    }

    // ── REGENERATE SECTION ─────────────────────────────────────────────────
    if (action === 'regenerate_section') {
      const { section, current_guide } = body;
      const ctx = `Platform: The Write Vibe — AI-powered self-publishing platform. Tagline: "Where Authors Find Their Voice". Primary color: #f59e0b (amber). Dark background: #0f172a.`;

      const sectionPrompts = {
        identity: `Rewrite the brand identity section with stronger investor-facing language. ${ctx} Return JSON: brand_promise, personality, voice, positioning, audience.`,
        colors: `Rewrite the color palette with better strategic rationale. ${ctx} Return JSON with "colors" array (keep amber #f59e0b primary). Each color: name, hex, role, usage, do, dont.`,
        typography: `Rewrite the typography system. ${ctx} Return JSON: scale (array, each: name, size, weight, font_family, example), rules.`,
        spacing: `Rewrite the spacing system. ${ctx} Return JSON: philosophy, scale (array: name, value, px).`,
        components: `Rewrite component standards. ${ctx} Return JSON with "components" array. Each: name, description, usage.`,
        applications: `Rewrite brand application examples. ${ctx} Return JSON with "applications" array. Each: context, guidance, example.`
      };

      const schemaMap = {
        identity: { type:"object", properties: { brand_promise:{type:"string"}, personality:{type:"string"}, voice:{type:"string"}, positioning:{type:"string"}, audience:{type:"string"} } },
        colors: { type:"object", properties: { colors: { type:"array", items:{type:"object"} } } },
        typography: { type:"object", properties: { scale:{type:"array",items:{type:"object"}}, rules:{type:"string"} } },
        spacing: { type:"object", properties: { philosophy:{type:"string"}, scale:{type:"array",items:{type:"object"}} } },
        components: { type:"object", properties: { components:{type:"array",items:{type:"object"}} } },
        applications: { type:"object", properties: { applications:{type:"array",items:{type:"object"}} } }
      };

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: sectionPrompts[section] || sectionPrompts.identity,
        response_json_schema: schemaMap[section] || schemaMap.identity
      });

      return Response.json({ success: true, section, data: result });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});