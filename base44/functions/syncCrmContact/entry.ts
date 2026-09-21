import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Upserts a newsletter subscriber or platform member into the CRM and enriches
 * the profile with AI-derived segmentation, motivations and next-best-action so
 * marketing can raise conversion, loyalty and organic advocacy.
 * Called by workflows (newsletter signup, member signup) and from the CRM page.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return Response.json({ error: 'email is required' }, { status: 400 });

    const source = body.source || 'newsletter';
    const now = new Date().toISOString();

    // Gather every signal we already hold about this person
    const subs = await svc.entities.NewsletterSubscriber.filter({ email });
    const users = await svc.entities.User.filter({ email });
    const member = users?.[0] || null;
    const bookIds = [...new Set(subs.map((s) => s.book_id).filter(Boolean))];

    const books = [];
    for (const id of bookIds.slice(0, 5)) {
      const found = await svc.entities.Book.filter({ id });
      if (found?.length) books.push(found[0]);
    }

    const existing = await svc.entities.CRMContact.filter({ email });
    const current = existing?.[0] || null;

    const name = body.name || member?.full_name || subs.find((s) => s.name)?.name || '';
    const activeSub = subs.some((s) => s.status !== 'unsubscribed');

    const signalText = [
      `Email: ${email}`,
      `Name: ${name || 'unknown'}`,
      `Entered via: ${source}`,
      `Registered platform member: ${member ? 'yes' : 'no'}`,
      member?.subscription_tier ? `Plan: ${member.subscription_tier}` : '',
      `Newsletter signups: ${subs.length} (${activeSub ? 'active' : 'unsubscribed'})`,
      books.length
        ? `Books they engaged with: ${books
            .map((b) => `${b.title} (${b.category || 'uncategorized'}${b.subcategory ? ', ' + b.subcategory : ''})`)
            .join('; ')}`
        : 'No specific book engagement yet',
      books.length
        ? `Audience notes from those books: ${books
            .map((b) => (b.target_audience?.interests || []).join(', '))
            .filter(Boolean)
            .join(' | ')}`
        : '',
      current?.enrichment_summary ? `Previous CRM insight: ${current.enrichment_summary}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const enrichment = await svc.integrations.Core.InvokeLLM({
      prompt: `You are the CRM strategist for Write Vibe, an AI book publishing platform.
Enrich this contact profile so the marketing team can increase conversion, build loyalty and earn organic promotion.
Base every field ONLY on the signals below — never invent personal facts (no employer, location, age, income).
Infer reader motivations from the genres/books and how they joined.

SIGNALS:
${signalText}

Return a practical, specific profile. lead_score is 0-100 based on how close they are to buying or advocating.`,
      response_json_schema: {
        type: 'object',
        properties: {
          lifecycle_stage: {
            type: 'string',
            enum: ['subscriber', 'lead', 'engaged', 'member', 'customer', 'advocate', 'dormant']
          },
          lead_score: { type: 'number' },
          segment: { type: 'string' },
          persona: { type: 'string' },
          interests: { type: 'array', items: { type: 'string' } },
          motivations: { type: 'array', items: { type: 'string' } },
          recommended_next_action: { type: 'string' },
          recommended_content: { type: 'string' },
          advocacy_potential: { type: 'string', enum: ['high', 'medium', 'low'] },
          loyalty_risk: { type: 'string', enum: ['high', 'medium', 'low'] },
          tags: { type: 'array', items: { type: 'string' } },
          enrichment_summary: { type: 'string' }
        }
      }
    });

    const e = enrichment || {};
    const payload = {
      email,
      name,
      source: current?.source || source,
      is_member: !!member,
      subscription_tier: member?.subscription_tier || current?.subscription_tier || '',
      newsletter_status: subs.length ? (activeSub ? 'active' : 'unsubscribed') : current?.newsletter_status || 'none',
      book_ids: bookIds,
      lifecycle_stage: e.lifecycle_stage || (member ? 'member' : 'subscriber'),
      lead_score: typeof e.lead_score === 'number' ? Math.max(0, Math.min(100, Math.round(e.lead_score))) : 0,
      segment: e.segment || '',
      persona: e.persona || '',
      interests: e.interests || [],
      motivations: e.motivations || [],
      recommended_next_action: e.recommended_next_action || '',
      recommended_content: e.recommended_content || '',
      advocacy_potential: e.advocacy_potential || 'medium',
      loyalty_risk: e.loyalty_risk || 'medium',
      tags: e.tags || [],
      enrichment_summary: e.enrichment_summary || '',
      enriched_at: now,
      last_activity_at: now,
      signup_count: (current?.signup_count || 0) + 1,
      first_seen_at: current?.first_seen_at || now
    };

    let contact;
    if (current) {
      contact = await svc.entities.CRMContact.update(current.id, payload);
    } else {
      contact = await svc.entities.CRMContact.create(payload);
    }

    return Response.json({ ok: true, created: !current, contact });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}