import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const arr = (t) => ({ type: 'array', items: t });
const S = { type: 'string' };

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { book_id } = await req.json().catch(() => ({}));
    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });
    const book = await base44.entities.Book.get(book_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const a = book.target_audience || {};
    const stores = (book.selected_bookstores || []).join(', ') || 'Amazon (default)';
    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior book marketing strategist. Build a multi-channel promotion strategy for this book.
Title: "${book.title}"
Category: ${book.category || 'General'}${book.subcategory ? ' / ' + book.subcategory : ''}
Summary: ${book.book_summary || book.plot_summary || 'n/a'}
Audience: age ${a.age_range || 'n/a'}; demographics ${(a.demographics || []).join(', ') || 'n/a'}; interests ${(a.interests || []).join(', ') || 'n/a'}; reading level ${a.reading_level || 'n/a'}
Chosen bookstores: ${stores}

Return: a one-paragraph positioning; an audience_summary; 6-8 channels (mix of owned, earned, paid, retail — e.g. email, specific social platforms that fit this audience, BookTok/Bookstagram, podcasts, bloggers, ads), each with why it fits this audience, 3-4 concrete tactics, cadence and one KPI; a budget_split across paid channels summing to 100; store-specific tactics for EACH chosen bookstore; and a first_30_days checklist of 8-10 actions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          positioning: S, audience_summary: S,
          channels: arr({ type: 'object', properties: { channel: S, type: S, why: S, tactics: arr(S), cadence: S, kpi: S } }),
          budget_split: arr({ type: 'object', properties: { channel: S, percent: { type: 'number' } } }),
          bookstore_tactics: arr({ type: 'object', properties: { store: S, tactics: arr(S) } }),
          first_30_days: arr(S),
        },
      },
    });

    const saved = await base44.entities.MarketingPlan.create({ book_id, ...plan });
    return Response.json({ plan: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}