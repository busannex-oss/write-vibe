import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const departments = body?.departments;
    const advisors = body?.advisors;

    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return Response.json({ error: 'Missing or invalid departments data' }, { status: 400 });
    }
    if (!advisors || !Array.isArray(advisors) || advisors.length === 0) {
      return Response.json({ error: 'Missing or invalid advisors data' }, { status: 400 });
    }

    // Build compact summaries for the LLM
    const deptSummary = departments.map(d =>
      `DEPARTMENT: ${d.name}\nAgents: ${d.agents.map(a => `${a.name} — ${a.title} (${a.role})`).join('; ')}`
    ).join('\n\n');

    const advisorSummary = advisors.map(a =>
      `${a.name} — Expertise: ${(a.expertise_tags || []).join(', ')}`
    ).join('\n');

    const prompt = `You are convening the Advisory Board of a major AI-powered publishing platform. The board must evaluate every department's structure, assign a Department Director from within each department's agents, identify bottlenecks and friction points, and recommend structural refinements.

DEPARTMENTS AND THEIR AGENTS:
${deptSummary}

ADVISORY BOARD MEMBERS:
${advisorSummary}

INSTRUCTIONS:
1. For each department, evaluate its current structure and assign a Department Director — the agent best suited to lead that department based on their title, role, and expertise. Provide a clear rationale for the choice.
2. Identify specific bottlenecks (workflow chokepoints, resource constraints, process gaps, single points of failure) within each department.
3. Identify friction points (cross-departmental handoff issues, communication gaps, role overlaps, redundant processes).
4. Recommend concrete structural refinements to remove bottlenecks and friction.
5. Assign a priority level (high/medium/low) to each department based on the urgency of needed changes.
6. Have each advisory board member contribute their individual assessment and recommendations based on their specific expertise and perspective.
7. Provide an overall executive summary of the convening and a final overall assessment of the organizational structure.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          meeting_summary: { type: "string", description: "Executive summary of the advisory board convening" },
          departments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                department_name: { type: "string" },
                assigned_director: { type: "string", description: "Name of the agent assigned as Department Director" },
                director_rationale: { type: "string", description: "Why this agent was chosen as director" },
                bottlenecks: { type: "array", items: { type: "string" } },
                friction_points: { type: "array", items: { type: "string" } },
                refinements: { type: "array", items: { type: "string" } },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          advisor_contributions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                advisor_name: { type: "string" },
                assessment: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          },
          overall_assessment: { type: "string", description: "Overall assessment of the organizational structure" }
        }
      }
    });

    // ── Generate comprehensive meeting minutes ──
    const meetingDate = new Date().toISOString();
    const attendees = (advisors || []).map(a => a.name);
    const departmentCount = (result.departments || []).length;

    let recommendationsTotal = 0;
    (result.departments || []).forEach(d => { recommendationsTotal += (d.refinements || []).length; });
    (result.advisor_contributions || []).forEach(a => { recommendationsTotal += (a.recommendations || []).length; });

    const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const deptMinutesHtml = (result.departments || []).map((dept, i) => {
      const bottlenecks = (dept.bottlenecks || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
      const friction = (dept.friction_points || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
      const refinements = (dept.refinements || []).map(r => `<li>${escapeHtml(r)}</li>`).join('');
      return `
        <h3>3.${i + 1} ${escapeHtml(dept.department_name)}</h3>
        <p><strong>Priority:</strong> ${escapeHtml(dept.priority)} &nbsp;|&nbsp; <strong>Assigned Director:</strong> ${escapeHtml(dept.assigned_director)}</p>
        <p><strong>Director Rationale:</strong> ${escapeHtml(dept.director_rationale)}</p>
        <h4>Bottlenecks Identified</h4>
        <ul>${bottlenecks || '<li>None identified.</li>'}</ul>
        <h4>Friction Points</h4>
        <ul>${friction || '<li>None identified.</li>'}</ul>
        <h4>Recommended Refinements</h4>
        <ul>${refinements || '<li>No refinements recommended.</li>'}</ul>`;
    }).join('');

    const advisorHtml = (result.advisor_contributions || []).map((adv, i) => {
      const recs = (adv.recommendations || []).map(r => `<li>${escapeHtml(r)}</li>`).join('');
      return `
        <h3>4.${i + 1} ${escapeHtml(adv.advisor_name)}</h3>
        <p><strong>Assessment:</strong> ${escapeHtml(adv.assessment)}</p>
        <p><strong>Recommendations:</strong></p>
        <ul>${recs || '<li>No recommendations provided.</li>'}</ul>`;
    }).join('');

    const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const minutesHtml = `<div class="minutes">
      <h1>ADVISORY BOARD MEETING MINUTES</h1>
      <div class="meeting-meta">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Meeting Type:</strong> Advisory Board Convening</p>
        <p><strong>Departments Evaluated:</strong> ${departmentCount}</p>
        <p><strong>Recommendations Generated:</strong> ${recommendationsTotal}</p>
        <p><strong>Attendees:</strong> ${escapeHtml(attendees.join(', '))}</p>
      </div>
      <h2>1. Call to Order</h2>
      <p>The Advisory Board was convened to evaluate the organizational structure of the platform. The board reviewed ${departmentCount} department${departmentCount !== 1 ? 's' : ''}, assigned Department Directors from within each department's agents, identified bottlenecks and friction points, and generated ${recommendationsTotal} recommendations for structural refinement.</p>
      <h2>2. Executive Summary</h2>
      <p>${escapeHtml(result.meeting_summary)}</p>
      <h2>3. Department Evaluations &amp; Director Assignments</h2>
      ${deptMinutesHtml}
      <h2>4. Advisor Contributions</h2>
      ${advisorHtml}
      <h2>5. Overall Assessment</h2>
      <p>${escapeHtml(result.overall_assessment)}</p>
      <h2>6. Adjournment</h2>
      <p>The meeting was adjourned following comprehensive evaluation. All ${recommendationsTotal} recommendations are pending administrative review (accept, reject, or refine). The next convening will be scheduled at the administration's discretion.</p>
    </div>`;

    // Store the minutes record
    const minutesRecord = await base44.asServiceRole.entities.AdvisoryBoardMinutes.create({
      meeting_title: `Advisory Board Convening — ${new Date(meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      meeting_date: meetingDate,
      meeting_type: "Advisory Board Convening",
      attendees,
      department_count: departmentCount,
      executive_summary: result.meeting_summary || "",
      overall_assessment: result.overall_assessment || "",
      recommendations_total: recommendationsTotal,
      minutes_html: minutesHtml,
      raw_results: JSON.stringify(result),
      status: "finalized"
    });

    return Response.json({ ...result, minutes_id: minutesRecord.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});