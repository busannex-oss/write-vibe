import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Advisor expertise mapping — which milestone types / keywords trigger each advisor
const ADVISOR_EXPERTISE = [
  {
    id: "advisory_toni_morrison",
    name: "Toni Morrison",
    expertise: ["literary", "prose", "voice", "character", "growth", "transformation", "emotional", "revelation"],
    milestone_types: ["growth", "transformation", "revelation", "introduction"],
    priority: "high",
    reason: "Toni Morrison's expertise in literary craft, character depth, and authentic voice is most relevant here."
  },
  {
    id: "advisory_jk_rowling",
    name: "J.K. Rowling",
    expertise: ["world", "arc", "plot", "mystery", "revelation", "structure", "arc_peak"],
    milestone_types: ["revelation", "arc_peak", "conflict", "introduction"],
    priority: "high",
    reason: "J.K. Rowling's mastery of plot structure and story revelation aligns with this milestone."
  },
  {
    id: "advisory_shonda_rhimes",
    name: "Shonda Rhimes",
    expertise: ["conflict", "drama", "dialogue", "tension", "narrative", "tv", "adaptation"],
    milestone_types: ["conflict", "arc_peak", "transformation"],
    priority: "high",
    reason: "Shonda Rhimes's expertise in high-stakes conflict and dramatic narrative is ideal for review here."
  },
  {
    id: "advisory_tyler_perry",
    name: "Tyler Perry",
    expertise: ["resolution", "redemption", "business", "commercial", "audience", "branding"],
    milestone_types: ["resolution", "transformation", "arc_peak"],
    priority: "medium",
    reason: "Tyler Perry's insight on commercial appeal and character resolution would strengthen this milestone."
  },
  {
    id: "advisory_thurgood_marshall",
    name: "Thurgood Marshall",
    expertise: ["justice", "legal", "rights", "moral", "ethics", "conflict"],
    milestone_types: ["conflict", "resolution", "revelation"],
    priority: "medium",
    reason: "Thurgood Marshall's perspective on moral conflict and justice themes adds strategic depth here."
  },
  {
    id: "advisory_slade_kevin_morrison",
    name: "Slade Kevin Morrison",
    expertise: ["vision", "strategy", "platform", "mission", "arc", "arc_peak"],
    milestone_types: ["arc_peak", "transformation", "resolution"],
    priority: "high",
    reason: "Slade Kevin Morrison's visionary perspective on narrative arc and strategic storytelling is critical here."
  },
];

function matchAdvisors(milestone) {
  const typeLC = (milestone.milestone_type || "").toLowerCase();
  const titleLC = (milestone.title || "").toLowerCase();
  const descLC = (milestone.description || "").toLowerCase();
  const combined = `${typeLC} ${titleLC} ${descLC}`;

  return ADVISOR_EXPERTISE.filter(advisor => {
    // Direct milestone type match
    const typeMatch = advisor.milestone_types.includes(typeLC);
    // Keyword match in title/description
    const keywordMatch = advisor.expertise.some(kw => combined.includes(kw));
    return typeMatch || keywordMatch;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { milestone_id, milestone, book_title } = body;

    if (!milestone || !milestone_id) {
      return Response.json({ error: 'milestone and milestone_id are required' }, { status: 400 });
    }

    const matched = matchAdvisors(milestone);
    if (matched.length === 0) {
      return Response.json({ notifications_created: 0, message: "No advisor matches for this milestone type." });
    }

    // Check for existing notifications to avoid duplicates
    const existing = await base44.asServiceRole.entities.AdvisoryNotification.filter({ milestone_id });
    const existingAdvisorIds = new Set(existing.map(n => n.advisor_id));

    const toCreate = matched.filter(a => !existingAdvisorIds.has(a.id));

    const created = [];
    for (const advisor of toCreate) {
      const notif = await base44.asServiceRole.entities.AdvisoryNotification.create({
        advisor_id: advisor.id,
        advisor_name: advisor.name,
        book_id: milestone.book_id,
        book_title: book_title || "Untitled Book",
        chapter_number: milestone.chapter_number,
        character_name: milestone.character_name,
        milestone_id,
        milestone_title: milestone.title,
        reason: advisor.reason,
        expertise_match: advisor.milestone_types.join(", "),
        status: "pending",
        priority: advisor.priority,
      });
      created.push(notif);
    }

    return Response.json({
      notifications_created: created.length,
      advisors_notified: toCreate.map(a => a.name),
      skipped_existing: matched.length - toCreate.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});