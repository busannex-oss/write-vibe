import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { book_title, author_name, asin } = await req.json();

    if (!book_title) return Response.json({ error: 'book_title required' }, { status: 400 });

    // Use LLM with web search to fetch real Amazon reviews
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Search Amazon for reviews of the book titled "${book_title}"${author_name ? ` by ${author_name}` : ''}${asin ? ` (ASIN: ${asin})` : ''}.
      
Find and extract the most recent and helpful customer reviews from Amazon.com.
Return up to 8 reviews with accurate data from the actual Amazon listing.
Include the overall star rating and total review count if available.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          amazon_url: { type: "string" },
          asin: { type: "string" },
          average_rating: { type: "number" },
          total_reviews: { type: "number" },
          reviews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                author_name: { type: "string" },
                rating: { type: "number" },
                title: { type: "string" },
                content: { type: "string" },
                date: { type: "string" },
                verified: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, data: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});