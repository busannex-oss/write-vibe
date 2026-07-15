import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Auto-Generate Platform Documents
 * Drafts & updates (versioned, dated) the platform's core admin documents
 * from the platform's own content & context:
 *   - Mission Statement
 *   - Constitution
 *   - White Paper
 *   - Business Plan
 *   - SOPs
 * Each generated document is stored as a NEW version (previous current
 * versions are flagged is_current=false so history is preserved).
 */
const PLATFORM_CONTEXT = `Write Vibe is an AI-powered book publishing studio platform that helps authors create, design, publish, and market books end-to-end. Core capabilities: AI manuscript writing, AI cover design, AI audiobook generation, AI marketing campaigns, Amazon KDP/ACX direct publishing integration, white-label B2B licensing, team collaboration, and an advisory board / chain-of-command of specialized AI agents. Founded 2025, Chicago IL. Operational pillars: Authenticity, Creativity, Empowerment, Innovation, Community, Excellence, Integrity, Growth. SaaS tiers: Starter $29/mo, Professional $79/mo, Enterprise $199/mo, White Label $999/mo.`;

const fmtDate = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const isoDate = () => new Date().toISOString().split('T')[0];

const llm = (base44, prompt) => base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

const nextVersion = (docs) => docs.reduce((m, d) => Math.max(m, d.version_number || 0), 0) + 1;

async function markNotCurrent(base44, docs) {
  for (const d of docs) {
    if (d.is_current) {
      await base44.asServiceRole.entities.Document.update(d.id, { is_current: false });
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results = {};
    const dateStr = fmtDate();

    // ── Gather platform context (current mission statement) ────────────────
    let missionContext = '';
    try {
      const missions = await base44.asServiceRole.entities.MissionStatement.filter({ is_current: true });
      if (missions.length > 0) missionContext = missions[0].text || '';
    } catch (_) {}

    // ── Gather platform latest activity (books, reviews, payments) ─────────
    let activityBlock = '';
    try {
      const recentBooks = await base44.asServiceRole.entities.Book.list('-updated_date', 10);
      const bookLines = recentBooks.map(b => `- "${b.title}" (${b.status || 'draft'})`).join('\n');
      const reviews = await base44.asServiceRole.entities.Review.list('-created_date', 5);
      const reviewLines = reviews.map(r => `- ${r.rating}★ by ${r.author_name}: "${(r.content || '').slice(0, 80)}"`).join('\n');
      const payments = await base44.asServiceRole.entities.Payment.list('-created_date', 5);
      const paymentLines = payments.map(p => `- ${p.plan} ($${p.amount}) ${p.status}`).join('\n');
      activityBlock = `\n\nRECENT PLATFORM ACTIVITY (latest):\nRecent books:\n${bookLines || '(none)'}\n\nRecent reviews:\n${reviewLines || '(none)'}\n\nRecent payments:\n${paymentLines || '(none)'}\n`;
    } catch (_) {}

    const contextBlock = `${PLATFORM_CONTEXT}\n\n${missionContext ? `Current mission statement:\n"${missionContext}"\n\n` : ''}Date: ${dateStr}${activityBlock}`;

    // ── 1. MISSION STATEMENT ───────────────────────────────────────────────
    const missionText = await llm(base44, `Based on this platform context, write a clear, inspiring mission statement for Write Vibe (2-3 sentences). ${contextBlock}`);
    const oldMissions = await base44.asServiceRole.entities.MissionStatement.filter({ is_current: true });
    for (const m of oldMissions) {
      await base44.asServiceRole.entities.MissionStatement.update(m.id, { is_current: false });
    }
    const allMissions = await base44.asServiceRole.entities.MissionStatement.filter({});
    const missionVersion = allMissions.reduce((mx, m) => Math.max(mx, m.version_number || 0), 0) + 1;
    await base44.asServiceRole.entities.MissionStatement.create({
      text: missionText,
      version_number: missionVersion,
      is_current: true,
      publish_date: isoDate(),
      is_public: false,
      analysis_status: 'complete'
    });
    results.mission_statement = { version: missionVersion, status: 'generated' };

    // ── 2. CONSTITUTION ────────────────────────────────────────────────────
    const constDocs = await base44.asServiceRole.entities.Document.filter({ type: 'constitution', book_id: 'admin' });
    await markNotCurrent(base44, constDocs);
    const constVersion = nextVersion(constDocs);
    const constText = await llm(base44, `You are drafting the foundational Constitution for Write Vibe. Write a comprehensive platform Constitution with articles: Preamble, Core Values, Governance, AI Ethics & Principles, Member Rights & Responsibilities, Advisory Board, Amendments. Formal authoritative tone. ${contextBlock}\n\nOutput the full constitution text only.`);
    await base44.asServiceRole.entities.Document.create({
      type: 'constitution', book_id: 'admin', title: 'Write Vibe Platform Constitution',
      content: constText, status: 'final', version_number: constVersion, is_current: true, generated_at: dateStr
    });
    results.constitution = { version: constVersion, status: 'generated' };

    // ── 3 & 4. WHITE PAPER + BUSINESS PLAN (both type white_paper, split by [BIZPLAN] prefix) ──
    const wpDocs = await base44.asServiceRole.entities.Document.filter({ type: 'white_paper', book_id: 'admin' });
    const whitePapers = wpDocs.filter(d => !(d.title || '').startsWith('[BIZPLAN]'));
    const bizPlans = wpDocs.filter(d => (d.title || '').startsWith('[BIZPLAN]'));

    // White Paper
    await markNotCurrent(base44, whitePapers);
    const wpVersion = nextVersion(whitePapers);
    const wpText = await llm(base44, `You are a senior industry analyst. Write an investment-grade white paper for Write Vibe covering: Executive Summary, Platform Overview, Market Opportunity & Sizing (TAM/SAM/SOM with figures), Financial Model & Revenue Projections, Competitive Landscape, Technology & AI Infrastructure, Go-to-Market Strategy, Risk Factors, Investment Thesis, Conclusion. ${contextBlock}\n\nUse specific figures. ALL CAPS section headers. ~1500 words. Output the white paper text only.`);
    await base44.asServiceRole.entities.Document.create({
      type: 'white_paper', book_id: 'admin', title: 'Write Vibe — Platform White Paper',
      content: wpText, status: 'final', version_number: wpVersion, is_current: true, generated_at: dateStr
    });
    results.white_paper = { version: wpVersion, status: 'generated' };

    // Business Plan
    await markNotCurrent(base44, bizPlans);
    const bpVersion = nextVersion(bizPlans);
    const bpText = await llm(base44, `You are a McKinsey partner and CFO-level strategist. Write a board-ready 30-Year Strategic Business Plan for Write Vibe with ALL CAPS sections: Executive Summary, Company Overview & Value Proposition, Market Analysis, Product Roadmap, Phase 1 Strategy (Years 1-5), Phase 2 Strategy (Years 6-10), Phase 3 Strategy (Years 11-20), Phase 4 Strategy (Years 21-30), Financial Projections, Risk Analysis & Mitigation, Technology & AI Strategy, Organizational Design, Investor Value Proposition, Conclusion & 90-Day Action Plan. ${contextBlock}\n\nUse specific dollar amounts, headcount, percentages, and dates. ~1800 words. Output the plan text only.`);
    await base44.asServiceRole.entities.Document.create({
      type: 'white_paper', book_id: 'admin', status: 'draft',
      title: `[BIZPLAN] Write Vibe — 30-Year Strategic Business Plan`,
      content: bpText, version_number: bpVersion, is_current: true, generated_at: dateStr
    });
    results.business_plan = { version: bpVersion, status: 'generated' };

    // ── 5. SOPs ────────────────────────────────────────────────────────────
    // Archive previous auto-generated SOPs (preserved as history), then generate a fresh set.
    const existingSops = await base44.asServiceRole.entities.SOP.filter({ auto_generated: true });
    for (const s of existingSops) {
      if (s.status !== 'archived') {
        await base44.asServiceRole.entities.SOP.update(s.id, { status: 'archived' });
      }
    }

    const sopSchema = {
      type: 'object',
      properties: {
        sops: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              purpose: { type: 'string' },
              scope: { type: 'string' },
              trigger: { type: 'string' },
              pillar_alignment: { type: 'array', items: { type: 'string' } },
              notes: { type: 'string' },
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    step_number: { type: 'number' },
                    step_name: { type: 'string' },
                    instruction: { type: 'string' },
                    responsible_role: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    };
    const sopResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on this platform context, generate 6-8 Standard Operating Procedures covering Write Vibe's key operations: book creation workflow, AI agent orchestration, manuscript generation & editing, cover design, publishing & distribution, marketing campaigns, team collaboration, quality assurance, member onboarding, and advisory board reviews. Each SOP needs purpose, scope, trigger, pillar_alignment, 4-6 steps (step_number, step_name, instruction, responsible_role), and notes. ${contextBlock}`,
      response_json_schema: sopSchema
    });
    const sops = (sopResult && sopResult.sops) || [];
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + 6);
    const reviewDateStr = reviewDate.toISOString().split('T')[0];

    for (const sop of sops) {
      await base44.asServiceRole.entities.SOP.create({
        title: sop.title,
        purpose: sop.purpose,
        scope: sop.scope,
        trigger: sop.trigger,
        pillar_alignment: sop.pillar_alignment || [],
        steps: (sop.steps || []).map((st, i) => ({
          step_number: st.step_number || i + 1,
          step_name: st.step_name,
          instruction: st.instruction,
          responsible_role: st.responsible_role
        })),
        notes: sop.notes,
        owner: 'AI Auto-Generated',
        status: 'draft',
        version: 1,
        auto_generated: true,
        review_date: reviewDateStr,
        category_ids: []
      });
    }
    results.sops = { count: sops.length, status: 'generated' };

    results.generated_at = dateStr;
    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});