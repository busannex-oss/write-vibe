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

    // ── generate_deep — AI-generate from source materials (white papers, agents, biz plan) ──
    if (action === 'generate_deep') {
      const { refinement_notes } = body;

      // Gather source materials
      const [documents, agentMemories] = await Promise.all([
        base44.asServiceRole.entities.Document.list(),
        base44.asServiceRole.entities.AgentMemory.list()
      ]);

      // White papers & business plans
      const whitePapers = documents.filter(d => d.type === 'white_paper' || d.type === 'publisher_letter');
      const wpSummary = whitePapers.slice(0, 3).map(d =>
        `[${d.title}]\n${(d.content || '').slice(0, 800)}`
      ).join('\n\n---\n\n');

      // Agent profiles — read from the known agent roster
      const agentRoster = [
        { name: 'Marcus Whitmore', title: 'Brand Guardian', mission: 'Enforce unwavering brand consistency and compliance across all outputs' },
        { name: 'Sam Johnson', title: 'Automation Orchestrator', mission: 'Schedule, monitor, and optimize all platform automations with SLA enforcement' },
        { name: 'Sam Thompson', title: 'Project Manager', mission: 'Oversee all book projects from conception to publication' },
        { name: 'James Mitchell', title: 'Character Creator', mission: 'Craft vivid, psychologically complex characters with compelling backstories' },
        { name: 'Olivia Rodriguez', title: 'Outline Generator', mission: 'Create comprehensive, emotionally resonant story outlines' },
        { name: 'Derek Thompson', title: 'Cover Designer', mission: 'Design visually stunning, strategically positioned book covers' },
        { name: 'Rachel Chen', title: 'Summary Writer', mission: 'Craft compelling book summaries that convert browsers into buyers' },
        { name: 'Lexie Chen', title: 'Title & SEO Strategist', mission: 'Generate compelling market-winning book titles with integrated SEO strategy' },
        { name: 'Priya Patel', title: 'Marketing Assistant', mission: 'Execute multi-channel marketing campaigns driving book awareness and sales' },
        { name: 'Nathan Brooks', title: 'Bookstore Advisor', mission: 'Strategically position books in the most profitable distribution channels' },
        { name: 'Chloe Martinez', title: 'Video Producer', mission: 'Create visually compelling book video commercials' },
        { name: 'David Chen', title: 'Audiobook Producer', mission: 'Generate professional-quality audiobook narrations via AI voice technology' },
        { name: 'Victoria Lopez', title: 'Brand Strategist', mission: 'Build and evolve author brands that drive long-term reader loyalty' },
        { name: 'Dr. Samantha Brooks', title: 'Ethical AI Officer', mission: 'Enforce ethical standards, regulatory compliance, and AI safety protocols' },
        { name: 'Dr. Aisha Morgan', title: 'Diagnostics Agent', mission: 'Identify, analyze, and resolve application errors with precision' },
        { name: 'Angela Kim', title: 'Membership Manager', mission: 'Manage user memberships and feature access across all subscription tiers' },
        { name: 'Michael Torres', title: 'Lead Magnet Designer', mission: 'Design high-conversion lead magnets that build sustainable audience growth' },
        { name: 'Isabella Santos', title: 'Seasonal Newsletter Strategist', mission: 'Plan and execute year-round newsletter campaigns for audience engagement' },
        { name: 'Kevin Murphy', title: 'Website Builder', mission: 'Create professional, conversion-optimized author and book websites' },
        { name: 'Emma Lewis', title: 'Text Formatter', mission: 'Transform raw text into professionally formatted, highly readable content' },
        { name: 'Thomas Wright', title: 'Structure Sentinel', mission: 'Enforce organizational consistency and structural integrity across documentation' },
        { name: 'Luis Garcia', title: 'Media Production Agent', mission: 'Orchestrate and optimize all audio and video production pipelines' }
      ];
      const agentsSummary = agentRoster.map(a => `- ${a.name} (${a.title}): ${a.mission}`).join('\n');

      const prompt = `You are a senior brand strategist tasked with crafting the definitive mission statement for Write Vibe.

WRITE VIBE PLATFORM OVERVIEW:
Write Vibe is an AI-powered book creation and publishing platform. It enables authors to write, design, market, and publish professional books using a full team of specialized AI agents — from character creation and outlining through manuscript writing, cover design, audiobooks, marketing campaigns, and Amazon publishing.

ADVISORY BOARD OF AI AGENTS (22 specialists):
${agentsSummary}

BUSINESS INTELLIGENCE FROM SOURCE DOCUMENTS:
${wpSummary || 'Write Vibe empowers authors with AI tools across the full publishing lifecycle: writing, design, marketing, and distribution. Founded 2025, Chicago IL. Target: 11M+ self-publishing authors globally. Subscription tiers: Starter, Professional, Enterprise, White Label.'}

BRAND PILLARS: Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth

${refinement_notes ? `REFINEMENT NOTES FROM REVIEWER:\n${refinement_notes}\n\nUse these notes to improve upon the previous version.` : 'Generate the most comprehensive and authentic mission statement possible.'}

INSTRUCTIONS:
- Write a 2-4 sentence mission statement that:
  * Reflects the full scope of what Write Vibe does (AI-powered, full lifecycle, community)
  * Honors the collective purpose of all 22 specialized agents
  * Resonates with authors at all levels (debut to professional)
  * Feels authentic, inspiring, and differentiated — not generic SaaS copy
  * Embeds at least 3 of the 8 brand pillars naturally

Return ONLY the mission statement text. No preamble, no explanation, no quotes.`;

      const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6'
      });
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