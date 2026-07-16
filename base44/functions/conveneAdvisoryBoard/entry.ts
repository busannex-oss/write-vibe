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

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});