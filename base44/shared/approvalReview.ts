// Two-agent review for actions that need admin approval:
// Alexandar Sterling votes first, Rose McLaurin second, then the admin decides.
// When both agents reach the same decision, minutes are recorded.

export const REVIEWERS = [
  { key: 'personal_executive_assistant', name: 'Alexandar Sterling', role: "Personal Executive Assistant — protects the founder's interests and representation" },
  { key: 'rose_mclaurin', name: 'Rose McLaurin', role: 'Executive Review Officer — independent second reviewer for governance and quality' }
];

const VOTE_SCHEMA = {
  type: 'object',
  properties: {
    decision: { type: 'string', enum: ['accept', 'reject', 'refine', 'comment', 'recommend'] },
    rationale: { type: 'string' },
    recommendation: { type: 'string', description: 'The specific action or change you recommend' }
  },
  required: ['decision', 'rationale', 'recommendation']
};

const esc = (s) => String(s || '').replace(/</g, '&lt;');

export async function reviewTask(svc, task) {
  const reviews = [];
  for (const r of REVIEWERS) {
    const prior = reviews.map((v) => `${v.reviewer}: ${v.decision.toUpperCase()} — ${v.rationale} (Recommends: ${v.recommendation})`).join('\n');
    const vote = await svc.integrations.Core.InvokeLLM({
      prompt: `You are ${r.name}, ${r.role}, on the Write Vibe publishing platform.
An agent action requires administrative approval. Cast your vote.
Choose ONE decision: accept (proceed as is), reject (do not proceed), refine (proceed only after changes), comment (neutral observation), recommend (propose a different action).
Always state the specific action you recommend.

Action: ${task.title}
Type: ${task.action_type} · Area: ${task.area} · Assigned agent: ${task.agent_name || 'n/a'}
Instructions: ${task.instructions || 'none'}
${prior ? `\nPrior votes:\n${prior}` : ''}`,
      response_json_schema: VOTE_SCHEMA
    });
    reviews.push({ reviewer: r.name, reviewer_key: r.key, ...vote, at: new Date().toISOString() });
  }

  const agreed = reviews[0].decision === reviews[1].decision;
  const update: Record<string, unknown> = {
    reviews,
    consensus: agreed ? reviews[0].decision : 'split',
    history: [...(task.history || []),
      ...reviews.map((v) => ({ at: v.at, event: `Voted ${v.decision}`, by: v.reviewer })),
      { at: new Date().toISOString(), event: agreed ? `Agreement reached: ${reviews[0].decision}` : 'Reviewers split — admin decides', by: 'Review Board' }]
  };

  if (agreed) {
    const minutes = await svc.entities.AdvisoryBoardMinutes.create({
      meeting_title: `Approval Review — ${task.title}`,
      meeting_date: new Date().toISOString(),
      meeting_type: 'Approval Review Agreement',
      attendees: REVIEWERS.map((r) => r.name),
      executive_summary: `Alexandar Sterling and Rose McLaurin agreed to ${reviews[0].decision.toUpperCase()} "${task.title}". Pending administrator review.`,
      overall_assessment: reviews.map((v) => `${v.reviewer}: ${v.rationale}`).join(' '),
      recommendations_total: reviews.length,
      minutes_html: `<h2>Action under review</h2><p><strong>${esc(task.title)}</strong> (${task.action_type})</p><p>${esc(task.instructions)}</p>
<h2>Votes</h2>${reviews.map((v) => `<h3>${v.reviewer} — ${v.decision.toUpperCase()}</h3><p>${esc(v.rationale)}</p><p><em>Recommended action:</em> ${esc(v.recommendation)}</p>`).join('')}
<h2>Resolution</h2><p>Both reviewers agreed: <strong>${reviews[0].decision.toUpperCase()}</strong>. Forwarded to the administrator.</p>
<h2>Changes that follow</h2><ul><li>Awaiting administrator decision.</li></ul>`,
      raw_results: JSON.stringify({ task_id: task.id, reviews }),
      status: 'draft'
    });
    update.minutes_id = minutes.id;
  }

  await svc.entities.AgentTask.update(task.id, update);
  return update;
}

export async function recordAdminDecision(svc, task, decision, note, adminName) {
  const approved = decision === 'approve';
  await svc.entities.AgentTask.update(task.id, {
    status: approved ? 'approved' : 'stopped',
    history: [...(task.history || []), { at: new Date().toISOString(), event: `Admin ${approved ? 'approved' : 'rejected'}${note ? `: ${note}` : ''}`, by: adminName }]
  });
  if (task.minutes_id) {
    const m = await svc.entities.AdvisoryBoardMinutes.get(task.minutes_id);
    const change = `<li>${new Date().toLocaleString('en-US')}: Administrator ${approved ? 'APPROVED' : 'REJECTED'} the action${note ? ` — ${esc(note)}` : ''}. Task ${approved ? 'proceeds to execution' : 'was stopped'}.</li>`;
    await svc.entities.AdvisoryBoardMinutes.update(task.minutes_id, {
      minutes_html: m.minutes_html.replace('<li>Awaiting administrator decision.</li>', change),
      status: 'finalized'
    });
  }
}