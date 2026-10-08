import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Called from entity automation: { event, data }
    // or directly: { user_id, plan }
    const { event, data, user_id, plan } = body;

    const serviceBase44 = base44.asServiceRole;

    // Auto-assign on user create
    if (event?.type === 'create' && event?.entity_name === 'User') {
      const userId = event.entity_id;
      // Never trust request-supplied data — load the real record
      const found = userId ? await serviceBase44.entities.User.filter({ id: userId }) : [];
      const userData = found?.[0];
      if (!userData) return Response.json({ error: 'User not found' }, { status: 404 });

      // Only assign if not already set
      if (!userData.subscription_tier && !userData.membership_assigned_at) {
        await serviceBase44.entities.User.update(userId, {
          subscription_tier: 'trial',
          membership_assigned_at: new Date().toISOString(),
          trial_started_at: new Date().toISOString()
        });
        return Response.json({ success: true, message: `User ${userId} assigned to trial` });
      }
      return Response.json({ success: true, message: 'User already has a plan' });
    }

    // Manual plan assignment: { user_id, plan }
    if (user_id && plan) {
      const user = await base44.auth.me().catch(() => null);
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const validPlans = ['trial', 'starter', 'professional', 'enterprise', 'white_label'];
      if (!validPlans.includes(plan)) {
        return Response.json({ error: 'Invalid plan' }, { status: 400 });
      }

      const updateData = {
        subscription_tier: plan,
        membership_assigned_at: new Date().toISOString()
      };
      if (plan === 'trial') {
        updateData.trial_started_at = new Date().toISOString();
      }

      await serviceBase44.entities.User.update(user_id, updateData);
      return Response.json({ success: true, message: `User ${user_id} assigned to ${plan}` });
    }

    // Audit: find users with no plan assigned
    if (body.action === 'audit') {
      const caller = await base44.auth.me().catch(() => null);
      if (caller?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const allUsers = await serviceBase44.entities.User.list();
      const unassigned = allUsers.filter(u => !u.subscription_tier);
      
      // Auto-fix unassigned users
      for (const u of unassigned) {
        await serviceBase44.entities.User.update(u.id, {
          subscription_tier: 'trial',
          membership_assigned_at: new Date().toISOString(),
          trial_started_at: new Date().toISOString()
        });
      }

      const grouped = allUsers.reduce((acc, u) => {
        const tier = u.subscription_tier || 'unassigned';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      return Response.json({ 
        success: true, 
        total: allUsers.length,
        fixed: unassigned.length,
        breakdown: grouped
      });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});