import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const snapshot = (s: any, user: any, note?: string) => ({
  version: s.version || 1, title: s.title, purpose: s.purpose, scope: s.scope, trigger: s.trigger,
  steps: s.steps || [], notes: s.notes, status: s.status,
  saved_at: new Date().toISOString(), saved_by: user.full_name || user.email, change_note: note || ''
});

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    // ── LIST — fetch all SOPs with optional filters ─────────────────────────
    if (action === 'list') {
      const { status, pillar, owner, category_id, search } = body;
      let sops = await base44.asServiceRole.entities.SOP.list('-updated_date', 200);

      if (status) sops = sops.filter(s => s.status === status);
      if (pillar) sops = sops.filter(s => s.pillar_alignment?.includes(pillar));
      if (owner) sops = sops.filter(s => s.owner?.toLowerCase().includes(owner.toLowerCase()));
      if (category_id) sops = sops.filter(s => s.category_ids?.includes(category_id));
      if (search) {
        const q = search.toLowerCase();
        sops = sops.filter(s =>
          s.title?.toLowerCase().includes(q) ||
          s.purpose?.toLowerCase().includes(q) ||
          s.scope?.toLowerCase().includes(q)
        );
      }

      return Response.json({ success: true, sops });
    }

    // ── GET single SOP ──────────────────────────────────────────────────────
    if (action === 'get') {
      const { id } = body;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      const all = await base44.asServiceRole.entities.SOP.list();
      const sop = all.find(s => s.id === id) || null;
      return Response.json({ success: true, sop });
    }

    // ── CATEGORIES ──────────────────────────────────────────────────────────
    if (action === 'categories') {
      const cats = await base44.asServiceRole.entities.SOPCategory.list('name', 100);
      return Response.json({ success: true, categories: cats });
    }

    // ── REVIEW DUE ──────────────────────────────────────────────────────────
    if (action === 'review_due') {
      const today = new Date().toISOString().split('T')[0];
      const threshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const all = await base44.asServiceRole.entities.SOP.list('-review_date', 200);
      const due = all.filter(s => s.review_date && s.review_date <= threshold && s.status !== 'archived');
      return Response.json({ success: true, sops: due, today });
    }

    // ── CREATE ──────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { title, purpose, scope, pillar_alignment, trigger, owner, review_date, status, category_ids, steps, notes } = body;
      if (!title) return Response.json({ error: 'title required' }, { status: 400 });

      const sop = await base44.asServiceRole.entities.SOP.create({
        title, purpose, scope,
        pillar_alignment: pillar_alignment || [],
        trigger, owner, review_date,
        status: 'under_review',
        review_stage: 'pending_board',
        version: 1,
        category_ids: category_ids || [],
        steps: steps || [],
        notes
      });
      return Response.json({ success: true, sop });
    }

    // ── UPDATE ──────────────────────────────────────────────────────────────
    if (action === 'update') {
      const { id, ...fields } = body;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });

      // Snapshot the current version into history, then bump version if content changed
      if (fields.steps || fields.purpose || fields.scope) {
        const current = await base44.asServiceRole.entities.SOP.get(id);
        if (current) {
          fields.version = (current.version || 1) + 1;
          fields.version_history = [...(current.version_history || []), snapshot(current, user, fields.change_note)];
          fields.status = 'under_review';
          fields.review_stage = 'pending_board';
          fields.board_votes = [];
          fields.final_votes = [];
        }
      }
      delete fields.change_note;

      const updated = await base44.asServiceRole.entities.SOP.update(id, fields);
      return Response.json({ success: true, sop: updated });
    }

    // ── REVIEW — accept / reject / refine / assign ──────────────────────────
    if (action === 'review') {
      const { id, decision, note, assignee } = body;
      const current = await base44.asServiceRole.entities.SOP.get(id);
      if (!current) return Response.json({ error: 'SOP not found' }, { status: 404 });
      const statusFor = { accept: 'active', reject: 'draft', refine: 'under_review', assign: 'under_review' };
      const entry = {
        decision, note: note || '', version: current.version || 1,
        by: user.full_name || user.email, at: new Date().toISOString(),
        assignee: assignee ? `${assignee.agent_name}${assignee.department ? ` (${assignee.department})` : ''}` : ''
      };
      if (decision === 'refine' || decision === 'assign') {
        await base44.asServiceRole.entities.AgentTask.create({
          title: `${decision === 'refine' ? 'Refine' : 'Review'} SOP: ${current.title} (v${current.version || 1})`,
          instructions: `${note || 'Review this SOP and propose improvements.'}\n\nSOP id: ${id}`,
          area: 'general', action_type: 'draft', risk: 'low',
          agent_key: assignee?.agent_key || 'workflow_architect',
          agent_name: assignee?.agent_name || 'Elena Vasquez',
          status: 'queued', owner_email: user.email
        });
      }
      const updated = await base44.asServiceRole.entities.SOP.update(id, {
        status: statusFor[decision],
        review_stage: decision === 'accept' || decision === 'reject' ? 'decided' : 'refining',
        review_history: [...(current.review_history || []), entry]
      });
      return Response.json({ success: true, sop: updated });
    }

    // ── RESTORE — bring back an earlier version as a new version ────────────
    if (action === 'restore') {
      const { id, version } = body;
      const current = await base44.asServiceRole.entities.SOP.get(id);
      const old = (current.version_history || []).find(v => v.version === version);
      if (!old) return Response.json({ error: 'Version not found' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.SOP.update(id, {
        title: old.title, purpose: old.purpose, scope: old.scope, trigger: old.trigger,
        steps: old.steps || [], notes: old.notes,
        version: (current.version || 1) + 1,
        status: 'under_review',
        review_stage: 'pending_board', board_votes: [], final_votes: [],
        version_history: [...(current.version_history || []), snapshot(current, user, `Before restoring v${version}`)]
      });
      return Response.json({ success: true, sop: updated });
    }

    // ── ARCHIVE ─────────────────────────────────────────────────────────────
    if (action === 'archive') {
      const { id } = body;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.SOP.update(id, { status: 'archived' });
      return Response.json({ success: true, sop: updated });
    }

    // ── DELETE ──────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { id } = body;
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      await base44.asServiceRole.entities.SOP.delete(id);
      return Response.json({ success: true });
    }

    // ── CREATE CATEGORY ─────────────────────────────────────────────────────
    if (action === 'create_category') {
      const { name, description, color } = body;
      if (!name) return Response.json({ error: 'name required' }, { status: 400 });
      const cat = await base44.asServiceRole.entities.SOPCategory.create({ name, description, color: color || '#f59e0b' });
      return Response.json({ success: true, category: cat });
    }

    // ── AI GENERATE SOP ─────────────────────────────────────────────────────
    if (action === 'generate') {
      const { title, purpose, context, pillars } = body;
      if (!title) return Response.json({ error: 'title required' }, { status: 400 });

      const prompt = `You are an operations expert for Write Vibe, an AI-powered book creation and publishing platform.

Generate a comprehensive Standard Operating Procedure (SOP) for the following:

Title: "${title}"
${purpose ? `Purpose/Goal: ${purpose}` : ''}
${context ? `Additional context: ${context}` : ''}
${pillars?.length ? `Brand pillars to align with: ${pillars.join(', ')}` : ''}

Return a JSON object with exactly these fields:
{
  "purpose": "Clear 1-2 sentence purpose statement",
  "scope": "What this SOP covers and who it applies to",
  "trigger": "What event or condition triggers this SOP",
  "pillar_alignment": ["array of relevant pillars from: ${PILLARS.join(', ')}"],
  "steps": [
    {
      "step_number": 1,
      "step_name": "Short step title",
      "instruction": "Detailed instruction for this step",
      "responsible_role": "Role responsible (e.g. Author, Editor, Admin)"
    }
  ],
  "notes": "Any important notes or exceptions"
}

Generate 4-8 clear, actionable steps. Be specific to a book publishing / author platform context.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            purpose: { type: "string" },
            scope: { type: "string" },
            trigger: { type: "string" },
            pillar_alignment: { type: "array", items: { type: "string" } },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  step_name: { type: "string" },
                  instruction: { type: "string" },
                  responsible_role: { type: "string" }
                }
              }
            },
            notes: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, generated: result });
    }

    // ── GENERATE FROM DOCUMENT ───────────────────────────────────────────────
    if (action === 'generate_from_doc') {
      const { document, doc_type, pillars, owner, review_months } = body;
      if (!document) return Response.json({ error: 'document required' }, { status: 400 });

      const pillarCtx = pillars?.length ? `Focus especially on these brand pillars: ${pillars.join(', ')}.` : `Align with relevant pillars from: ${PILLARS.join(', ')}.`;

      const prompt = `You are a senior operations architect for The Write Vibe — an AI-powered book creation and self-publishing platform. 

A team member has submitted the following ${doc_type?.replace(/_/g, ' ')} for SOP extraction:

---
${document}
---

Your task: Analyze this documentation and extract 3–6 distinct Standard Operating Procedures that would help the team operate more consistently and effectively. Each SOP should be a standalone operational unit.

${pillarCtx}

Return JSON with a "sops" array. Each SOP must have:
- title: clear, action-oriented SOP name
- purpose: 1-2 sentences — why this SOP exists
- scope: what this SOP covers and who it applies to
- trigger: what event or condition initiates this SOP
- pillar_alignment: array of 1-3 relevant pillars from [${PILLARS.join(', ')}]
- steps: array of 4-8 steps, each with: step_number, step_name (short), instruction (detailed, actionable), responsible_role
- notes: any exceptions, edge cases, or important caveats

Be specific to the Write Vibe book publishing platform context. Make instructions actionable and unambiguous.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  purpose: { type: "string" },
                  scope: { type: "string" },
                  trigger: { type: "string" },
                  pillar_alignment: { type: "array", items: { type: "string" } },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_number: { type: "number" },
                        step_name: { type: "string" },
                        instruction: { type: "string" },
                        responsible_role: { type: "string" }
                      }
                    }
                  },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      return Response.json({ success: true, sops: result.sops || [] });
    }

    // ── NOTIFY OWNER ─────────────────────────────────────────────────────────
    if (action === 'notify_owner') {
      const { id } = body;
      const all = await base44.asServiceRole.entities.SOP.list();
      const sop = all.find(s => s.id === id);
      if (!sop) return Response.json({ error: 'SOP not found' }, { status: 404 });
      if (!sop.owner) return Response.json({ error: 'No owner set' }, { status: 400 });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sop.owner,
        subject: `[Write Vibe] SOP Review Due: ${sop.title}`,
        body: `Hello,\n\nThis is a reminder that the following SOP is due for review:\n\nTitle: ${sop.title}\nReview Date: ${sop.review_date}\nVersion: v${sop.version}\n\nPlease log in to Write Vibe to review and update this SOP.\n\nThank you,\nWrite Vibe Platform`
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});