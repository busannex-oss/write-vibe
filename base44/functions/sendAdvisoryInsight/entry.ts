import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Generates an AI insight summary from a completed advisory review and
 * writes it back to the associated CharacterMilestone as an advisor_note.
 * Also appends it to the notification's review_notes field.
 *
 * Payload: { notification_id: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notification_id } = await req.json();
    if (!notification_id) return Response.json({ error: 'notification_id is required' }, { status: 400 });

    // 1. Fetch the notification
    const notifs = await base44.asServiceRole.entities.AdvisoryNotification.filter({ id: notification_id });
    const notif = notifs[0];
    if (!notif) return Response.json({ error: 'Notification not found' }, { status: 404 });
    if (user.role !== 'admin') {
      let owns = notif.created_by_id === user.id || notif.created_by === user.email;
      if (!owns && notif.book_id) {
        const [bk] = await base44.asServiceRole.entities.Book.filter({ id: notif.book_id });
        owns = !!bk && (bk.created_by_id === user.id || bk.created_by === user.email);
      }
      if (!owns) return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch the related milestone for context
    let milestone = null;
    if (notif.milestone_id) {
      const milestones = await base44.asServiceRole.entities.CharacterMilestone.filter({ id: notif.milestone_id });
      milestone = milestones[0] || null;
    }

    // 3. Generate AI insight via InvokeLLM
    const prompt = `You are ${notif.advisor_name}, a world-class literary advisor.

You have just completed a review of the following manuscript milestone:

Book: ${notif.book_title || "Untitled"}
Chapter: ${notif.chapter_number}
Character: ${notif.character_name || "N/A"}
Milestone: ${notif.milestone_title || "N/A"}
Milestone Type: ${milestone?.milestone_type || "N/A"}
Description: ${milestone?.description || "N/A"}
Expertise you bring: ${notif.expertise_match || notif.reason || "N/A"}

Write a focused, actionable editorial insight (3-5 sentences) from your unique perspective. 
Be specific to this milestone. Provide concrete craft advice the author can immediately apply.
Do NOT be generic. Write as ${notif.advisor_name} would — with your distinctive voice and expertise.`;

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const insight = typeof llmResult === 'string' ? llmResult : llmResult?.text || llmResult?.content || String(llmResult);

    // 4. Save insight back to notification's review_notes
    const reviewNotes = `[${notif.advisor_name} · ${new Date().toLocaleDateString()}]\n${insight}`;
    await base44.asServiceRole.entities.AdvisoryNotification.update(notification_id, {
      review_notes: reviewNotes,
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
    });

    // 5. If milestone exists, append advisor note to its advisor_notes array
    if (milestone) {
      const existingNotes = Array.isArray(milestone.advisor_notes) ? milestone.advisor_notes : [];
      // Remove any existing note from the same advisor to avoid duplicates
      const filtered = existingNotes.filter(n => n.advisor_id !== notif.advisor_id);
      const updated = [
        ...filtered,
        {
          advisor_id: notif.advisor_id,
          advisor_name: notif.advisor_name,
          note: insight,
          rating: null,
        }
      ];
      await base44.asServiceRole.entities.CharacterMilestone.update(milestone.id, {
        advisor_notes: updated,
      });
    }

    return Response.json({
      success: true,
      advisor: notif.advisor_name,
      insight,
      milestone_updated: !!milestone,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});