import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILLARS = [
  "Authenticity", "Creativity", "Empowerment", "Innovation",
  "Community", "Excellence", "Integrity", "Growth"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check — admin only for mutations
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};
    const action = body.action || 'get';

    // ── GET /mission — fetch current mission statement ─────────────────────
    if (action === 'get') {
      const all = await base44.asServiceRole.entities.MissionStatement.list();
      const current = all.find(m => m.is_current) || all.sort((a, b) => b.version_number - a.version_number)[0] || null;
      return Response.json({ success: true, mission: current });
    }

    // ── GET /mission/versions — fetch version history ──────────────────────
    if (action === 'versions') {
      const all = await base44.asServiceRole.entities.MissionStatement.list();
      const sorted = all.sort((a, b) => b.version_number - a.version_number);
      return Response.json({ success: true, versions: sorted });
    }

    // ── GET /mission/alignment — fetch pillar alignment scores ─────────────
    if (action === 'alignment') {
      const all = await base44.asServiceRole.entities.MissionStatement.list();
      const current = all.find(m => m.is_current) || null;
      return Response.json({
        success: true,
        pillar_scores: current?.pillar_scores || [],
        overall_alignment_score: current?.overall_alignment_score || 0,
        alignment_analysis: current?.alignment_analysis || null
      });
    }

    // ── All mutations require admin ────────────────────────────────────────
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── generate — AI-generate a mission statement draft ──────────────────
    if (action === 'generate') {
      const { context, tone, focus_areas } = body;

      const prompt = `You are a brand strategist for Write Vibe, an AI-powered book creation platform that helps authors write, publish, and market their books using AI.

Generate a compelling, authentic mission statement for Write Vibe based on the following inputs:

${context ? `Context / additional notes: ${context}` : ''}
${tone ? `Desired tone: ${tone}` : ''}
${focus_areas?.length ? `Key focus areas: ${focus_areas.join(', ')}` : ''}

The mission statement should:
- Be 1-3 sentences, clear and inspiring
- Reflect Write Vibe's commitment to empowering authors with AI
- Feel genuine, not corporate or cliché
- Align with pillars: Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth

Return ONLY the mission statement text, no preamble or explanation.`;

      const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
      return Response.json({ success: true, text: generated.trim() });
    }

    // ── PUT /mission — create new version ─────────────────────────────────
    if (action === 'update') {
      const { text, change_rationale, is_public, pillar_scores } = body;
      if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

      // Get current version number
      const all = await base44.asServiceRole.entities.MissionStatement.list();
      const maxVersion = all.reduce((max, m) => Math.max(max, m.version_number || 0), 0);

      // Unset is_current on all existing
      for (const m of all.filter(m => m.is_current)) {
        await base44.asServiceRole.entities.MissionStatement.update(m.id, { is_current: false });
      }

      // Calculate overall score
      const scores = pillar_scores || PILLARS.map(p => ({ pillar_name: p, score: 0, notes: '' }));
      const validScores = scores.filter(s => s.score > 0);
      const overall = validScores.length > 0
        ? Math.round((validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length) * 10) / 10
        : 0;

      // Create new version
      const newMission = await base44.asServiceRole.entities.MissionStatement.create({
        text,
        version_number: maxVersion + 1,
        publish_date: new Date().toISOString().split('T')[0],
        is_current: true,
        is_public: is_public ?? false,
        change_rationale: change_rationale || '',
        pillar_scores: scores,
        overall_alignment_score: overall,
        analysis_status: 'pending'
      });

      // Trigger AI alignment analysis asynchronously
      triggerAlignmentAnalysis(base44, newMission.id, text, scores).catch(() => {});

      return Response.json({ success: true, mission: newMission });
    }

    // ── restore — restore a previous version as current ───────────────────
    if (action === 'restore') {
      const { id } = body;
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

      const all = await base44.asServiceRole.entities.MissionStatement.list();
      for (const m of all.filter(m => m.is_current)) {
        await base44.asServiceRole.entities.MissionStatement.update(m.id, { is_current: false });
      }
      const restored = await base44.asServiceRole.entities.MissionStatement.update(id, {
        is_current: true,
        publish_date: new Date().toISOString().split('T')[0]
      });
      return Response.json({ success: true, mission: restored });
    }

    // ── toggle_public — toggle public visibility ───────────────────────────
    if (action === 'toggle_public') {
      const { id, is_public } = body;
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.MissionStatement.update(id, { is_public });
      return Response.json({ success: true, mission: updated });
    }

    // ── update_scores — update pillar scores only ─────────────────────────
    if (action === 'update_scores') {
      const { id, pillar_scores } = body;
      if (!id || !pillar_scores) return Response.json({ error: 'id and pillar_scores required' }, { status: 400 });

      const validScores = pillar_scores.filter(s => s.score > 0);
      const overall = validScores.length > 0
        ? Math.round((validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length) * 10) / 10
        : 0;

      const updated = await base44.asServiceRole.entities.MissionStatement.update(id, {
        pillar_scores,
        overall_alignment_score: overall,
        analysis_status: 'pending'
      });

      const mission = await base44.asServiceRole.entities.MissionStatement.get('MissionStatement', id).catch(async () => {
        const all = await base44.asServiceRole.entities.MissionStatement.list();
        return all.find(m => m.id === id);
      });
      const text = mission?.text || '';
      triggerAlignmentAnalysis(base44, id, text, pillar_scores).catch(() => {});

      return Response.json({ success: true, mission: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function triggerAlignmentAnalysis(base44, missionId, text, pillar_scores) {
  try {
    await base44.asServiceRole.entities.MissionStatement.update(missionId, { analysis_status: 'analyzing' });

    const scoresText = pillar_scores.map(s => `- ${s.pillar_name}: ${s.score}/10${s.notes ? ` (${s.notes})` : ''}`).join('\n');
    const prompt = `You are a brand strategist for Write Vibe, an AI-powered book creation platform.

Analyze the following mission statement against each pillar score and provide:
1. A brief overall alignment assessment (2-3 sentences)
2. For each pillar, specific feedback on how the mission statement addresses or misses that pillar
3. Concrete suggestions to improve alignment

Mission Statement:
"${text}"

Current Pillar Scores:
${scoresText}

Respond in a clear, structured format with sections for each pillar and a summary.`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    await base44.asServiceRole.entities.MissionStatement.update(missionId, {
      alignment_analysis: analysis,
      analysis_status: 'complete'
    });
  } catch (err) {
    await base44.asServiceRole.entities.MissionStatement.update(missionId, {
      analysis_status: 'error',
      alignment_analysis: `Analysis failed: ${err.message}`
    });
  }
}