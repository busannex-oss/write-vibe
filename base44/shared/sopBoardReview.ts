// Advisory Board review for SOPs: every board member votes, then Alexandar Sterling
// and Rose McLaurin cast final votes. If they agree, the SOP moves forward;
// if they disagree, the founder decides.
import { FOUNDER_EMAIL } from './founder.ts';

export const BOARD = [
  ['Oprah Winfrey', 'Storytelling, Audience Building, Authenticity'],
  ['Tyler Perry', 'Narrative Arc, Character Voice, Cultural Relevance'],
  ['Thurgood Marshall', 'Intellectual Property, Publishing Law, Content Ethics'],
  ['Maya Angelou', 'Authentic Voice, Emotional Truth, Courage in Writing'],
  ['Slade Kevin Morrison', 'Platform Vision, Founder Strategy, Mission Alignment'],
  ['Marcus Y. Rosier', 'Leadership, Strategic Vision, Business Scaling'],
  ['Gary Vaynerchuk', 'Digital Marketing, Personal Branding, Content Strategy'],
  ['Spectacular Smith', 'Social Media Marketing, Brand Building, Viral Strategy'],
  ['Bozoma Saint John', 'Brand Marketing, Cultural Strategy, Consumer Insights'],
];
const FINAL = [
  ['Alexandar Sterling', "Personal Executive Assistant — protects the founder's interests and representation"],
  ['Rose McLaurin', 'Executive Review Officer — independent reviewer for governance and quality'],
];
const DECISION = { type: 'string', enum: ['accept', 'reject', 'refine'] };
const esc = (s: unknown) => String(s || '').replace(/</g, '&lt;');

const sopText = (s: any) => `Title: ${s.title} (v${s.version || 1})
Purpose: ${s.purpose || ''}
Scope: ${s.scope || ''}
Trigger: ${s.trigger || ''}
Steps:
${(s.steps || []).map((st: any) => `${st.step_number}. ${st.step_name} [${st.responsible_role}] — ${st.instruction}`).join('\n')}
Notes: ${s.notes || ''}`;

export async function reviewSop(svc: any, sop: any) {
  const now = () => new Date().toISOString();
  const version = sop.version || 1;

  const board = await svc.integrations.Core.InvokeLLM({
    prompt: `You are convening the Write Vibe Advisory Board to review a Standard Operating Procedure.
Each member below must cast an independent vote from their own expertise: accept (ready as is), reject (should not be used), or refine (usable only after specific changes). Give a concise rationale and, for refine, the exact changes needed.

Members:
${BOARD.map(([n, e]) => `- ${n} (${e})`).join('\n')}

SOP:
${sopText(sop)}`,
    response_json_schema: {
      type: 'object',
      properties: { votes: { type: 'array', items: { type: 'object', properties: {
        member: { type: 'string' }, decision: DECISION, rationale: { type: 'string' }, changes: { type: 'string' }
      }, required: ['member', 'decision', 'rationale'] } } },
      required: ['votes']
    }
  });
  const boardVotes = BOARD.map(([name]) => {
    const v = (board.votes || []).find((x: any) => x.member === name) || { decision: 'refine', rationale: 'No vote recorded.' };
    return { member: name, decision: v.decision, rationale: v.rationale, changes: v.changes || '', version, at: now() };
  });
  const tally = ['accept', 'reject', 'refine'].map((d) => `${d}: ${boardVotes.filter((v) => v.decision === d).length}`).join(', ');
  const boardSummary = boardVotes.map((v) => `${v.member}: ${v.decision.toUpperCase()} — ${v.rationale}${v.changes ? ` (Changes: ${v.changes})` : ''}`).join('\n');

  const finalVotes: any[] = [];
  for (const [name, role] of FINAL) {
    const prior = finalVotes.map((v) => `${v.member}: ${v.decision.toUpperCase()} — ${v.rationale}`).join('\n');
    const v = await svc.integrations.Core.InvokeLLM({
      prompt: `You are ${name}, ${role}, on the Write Vibe platform. The Advisory Board has voted on an SOP (tally — ${tally}).
Cast your final vote: accept, reject, or refine. Weigh the board's votes and explain your reasoning; for refine, state the exact changes.

SOP:
${sopText(sop)}

Advisory Board votes:
${boardSummary}
${prior ? `\nPrior final vote:\n${prior}` : ''}`,
      response_json_schema: { type: 'object', properties: { decision: DECISION, rationale: { type: 'string' }, changes: { type: 'string' } }, required: ['decision', 'rationale'] }
    });
    finalVotes.push({ member: name, decision: v.decision, rationale: v.rationale, changes: v.changes || '', version, at: now() });
  }

  const agreed = finalVotes[0].decision === finalVotes[1].decision;
  const outcome = agreed ? finalVotes[0].decision : 'split';
  const update: Record<string, unknown> = {
    board_votes: boardVotes,
    final_votes: finalVotes,
    review_stage: agreed ? (outcome === 'refine' ? 'refining' : 'decided') : 'awaiting_founder',
    status: agreed ? ({ accept: 'active', reject: 'draft', refine: 'under_review' } as any)[outcome] : 'under_review',
    review_history: [...(sop.review_history || []), {
      decision: agreed ? outcome : 'split', version, at: now(), by: 'Advisory Board',
      note: agreed ? `Board (${tally}). Alexandar Sterling and Rose McLaurin agreed to ${outcome.toUpperCase()}.` : `Board (${tally}). Final reviewers disagreed — awaiting founder decision.`
    }]
  };

  if (agreed && outcome === 'refine') {
    await svc.entities.AgentTask.create({
      title: `Refine SOP: ${sop.title} (v${version})`,
      instructions: `Apply the Advisory Board's requested changes, then resubmit for review.\n\n${finalVotes.map((v) => `${v.member}: ${v.changes || v.rationale}`).join('\n')}\n\nSOP id: ${sop.id}`,
      area: 'general', action_type: 'draft', risk: 'low',
      agent_key: 'workflow_architect', agent_name: 'Elena Vasquez', status: 'queued', owner_email: FOUNDER_EMAIL
    });
  }

  const vote = (v: any) => `<li><strong>${esc(v.member)} — ${v.decision.toUpperCase()}</strong>: ${esc(v.rationale)}${v.changes ? `<br/><em>Changes:</em> ${esc(v.changes)}` : ''}</li>`;
  const minutes = await svc.entities.AdvisoryBoardMinutes.create({
    meeting_title: `SOP Review — ${sop.title} (v${version})`,
    meeting_date: now(),
    meeting_type: 'SOP Review',
    attendees: [...BOARD.map(([n]) => n), ...FINAL.map(([n]) => n)],
    executive_summary: agreed ? `Board tally ${tally}. Final reviewers agreed: ${outcome.toUpperCase()}.` : `Board tally ${tally}. Final reviewers split; founder decision required.`,
    overall_assessment: finalVotes.map((v) => `${v.member}: ${v.rationale}`).join(' '),
    recommendations_total: boardVotes.length + finalVotes.length,
    minutes_html: `<h2>SOP under review</h2><p><strong>${esc(sop.title)}</strong> v${version}</p>
<h2>Advisory Board votes (${tally})</h2><ul>${boardVotes.map(vote).join('')}</ul>
<h2>Final votes</h2><ul>${finalVotes.map(vote).join('')}</ul>
<h2>Resolution</h2><p>${agreed ? `Agreed: <strong>${outcome.toUpperCase()}</strong>.` : 'Split decision — forwarded to the founder.'}</p>`,
    raw_results: JSON.stringify({ sop_id: sop.id, boardVotes, finalVotes }),
    status: agreed ? 'finalized' : 'draft'
  });
  update.minutes_id = minutes.id;

  if (!agreed) {
    await svc.integrations.Core.SendEmail({
      to: FOUNDER_EMAIL,
      from_name: 'Write Vibe Advisory Board',
      subject: `Your decision needed: SOP "${sop.title}"`,
      body: `<p>The Advisory Board reviewed <strong>${esc(sop.title)}</strong> (v${version}) — ${tally}.</p>
<p>Alexandar Sterling and Rose McLaurin disagreed:</p>${finalVotes.map((v) => `<p><strong>${v.member}: ${v.decision.toUpperCase()}</strong> — ${esc(v.rationale)}</p>`).join('')}
<p><a href="https://thewritevibe.net/SOPs">Review and decide</a></p>`
    });
  }

  return await svc.entities.SOP.update(sop.id, update);
}