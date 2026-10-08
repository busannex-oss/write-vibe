import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Block regular users; allow admins and scheduled automation invocations
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_) { /* automation */ }
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Find users who haven't been welcomed yet (no onboarding task from Sherry)
    const [users, onboardingTasks] = await Promise.all([
      svc.entities.User.list('-created_date', 100),
      svc.entities.DashboardTask.filter({ source: 'sherry_onboarding' }, '-created_date', 200),
    ]);
    const welcomedEmails = new Set(onboardingTasks.map(t => t.user_email));
    // Only welcome users who joined after this workflow went live — existing users are skipped
    const LAUNCH_DATE = '2026-07-16T03:00:00Z';
    const newUsers = users.filter(u =>
      u.email &&
      !welcomedEmails.has(u.email) &&
      new Date(u.created_date) > new Date(LAUNCH_DATE)
    );

    const welcomed = [];
    for (const newUser of newUsers) {
      const firstName = (newUser.full_name || '').split(' ')[0] || 'there';

      // 1. Welcome message from Sherry — lands in their Customer Service inbox & dashboard widget
      await svc.entities.InternalMessage.create({
        thread_id: newUser.id,
        sender_type: 'agent',
        sender_id: 'master_customer_service',
        sender_name: 'Sherry Givens',
        recipient_id: newUser.id,
        recipient_name: newUser.full_name || newUser.email,
        agent_id: 'master_customer_service',
        content: `Hey ${firstName}! Welcome to Write Vibe — I'm Sherry, and I'll be your go-to person around here. I've been helping authors for over twenty years, and I can already tell you're going to love what this place can do. Whenever you're ready, head over and create your first book — the AI will walk you through outlines, characters, chapters, covers, all of it. And if you ever get stuck or just want to talk through an idea, I'm right here. Happy writing!`,
        is_read: false,
      });

      // 2. Getting-started task on their dashboard
      await svc.entities.DashboardTask.create({
        user_email: newUser.email,
        title: 'Create your first book',
        description: 'Start your first book project — the AI will guide you through outlines, characters, and chapters.',
        link_page: 'CreateBook',
        source: 'sherry_onboarding',
        completed: false,
      });

      welcomed.push(newUser.email);
    }

    return Response.json({ success: true, welcomed_count: welcomed.length, welcomed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});