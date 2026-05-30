import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { book_id } = body;

    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });

    const books = await base44.entities.Book.list();
    const book = books.find(b => b.id === book_id);
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const audience = book.target_audience || {};
    const category = book.category || 'General Fiction';
    const subcategory = book.subcategory || '';
    const subjects = (book.subjects || []).join(', ') || 'Not specified';
    const summary = book.book_summary || book.plot_summary || 'Not available';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `You are a world-class book marketing strategist. Create a detailed, step-by-step marketing launch plan for this book.

Book: "${book.title}"
Genre/Category: ${category}${subcategory ? ` → ${subcategory}` : ''}
Subjects/Keywords: ${subjects}
Summary: ${summary}
Target Audience:
  - Age Range: ${audience.age_range || 'Not specified'}
  - Demographics: ${(audience.demographics || []).join(', ') || 'Not specified'}
  - Interests: ${(audience.interests || []).join(', ') || 'Not specified'}
  - Reading Level: ${audience.reading_level || 'Not specified'}

Build a comprehensive, phased marketing launch plan with:
- Pre-launch (8 weeks before), Launch Week, and Post-launch (4 weeks after) phases
- Platform-specific tactics matched to the audience demographics and genre
- Specific action items with timeframes, estimated costs, and expected outcomes
- Tailored messaging angles for this exact audience and category
- KPIs and success metrics for each phase

Return JSON with this exact structure:
{
  "executive_summary": "<2-3 sentence overview of the launch strategy>",
  "target_audience_insights": "<How this audience consumes content and makes buying decisions>",
  "key_messages": ["<message 1>", "<message 2>", "<message 3>"],
  "phases": [
    {
      "name": "<phase name>",
      "duration": "<e.g. Weeks 1-4>",
      "goal": "<primary objective>",
      "steps": [
        {
          "week": "<week range or day>",
          "action": "<specific action>",
          "platform": "<where to execute>",
          "detail": "<exactly how to do it>",
          "estimated_cost": "<$0 / $XX / $XX-$XX>",
          "expected_outcome": "<what success looks like>",
          "priority": "high" | "medium" | "low"
        }
      ]
    }
  ],
  "budget_breakdown": [
    { "category": "<e.g. Paid Ads>", "recommended_spend": "<$XX>", "rationale": "<why>" }
  ],
  "kpis": [
    { "metric": "<e.g. Pre-orders>", "target": "<e.g. 100 in first week>", "tracking_method": "<how to measure>" }
  ],
  "quick_wins": ["<fast action with high impact 1>", "<fast action 2>", "<fast action 3>"]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          target_audience_insights: { type: "string" },
          key_messages: { type: "array", items: { type: "string" } },
          phases: { type: "array", items: { type: "object" } },
          budget_breakdown: { type: "array", items: { type: "object" } },
          kpis: { type: "array", items: { type: "object" } },
          quick_wins: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, plan: result, book_title: book.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});