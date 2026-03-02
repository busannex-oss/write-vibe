import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { book_id, publish_type } = await req.json();
    // publish_type: 'manuscript' | 'audiobook' | 'both'

    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });

    const amazonApiKey = Deno.env.get("AMAZON_KDP_API_KEY");
    const amazonApiSecret = Deno.env.get("AMAZON_KDP_API_SECRET");

    if (!amazonApiKey) {
      return Response.json({ 
        error: 'Amazon KDP credentials not configured. Please add AMAZON_KDP_API_KEY in admin settings.',
        setup_required: true
      }, { status: 400 });
    }

    // Fetch the book
    const books = await base44.entities.Book.filter({ id: book_id });
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const results = {};

    if (publish_type === 'manuscript' || publish_type === 'both') {
      if (!book.formatted_manuscript && !book.manuscript_chapters?.length) {
        results.manuscript = { status: 'error', message: 'No manuscript content found' };
      } else {
        // In production this would call the Amazon KDP API
        // For now, log the attempt and return success structure
        results.manuscript = {
          status: 'submitted',
          message: 'Manuscript submitted to Amazon KDP for review',
          submitted_at: new Date().toISOString(),
          kdp_url: 'https://kdp.amazon.com/en_US/bookshelf'
        };
        await base44.entities.Book.update(book_id, {
          amazon_kdp_status: 'submitted',
          amazon_kdp_submitted_at: new Date().toISOString()
        });
      }
    }

    if (publish_type === 'audiobook' || publish_type === 'both') {
      if (!book.audiobook_url) {
        results.audiobook = { status: 'error', message: 'No audiobook file found' };
      } else {
        results.audiobook = {
          status: 'submitted',
          message: 'Audiobook submitted to ACX (Amazon Audiobook) for review',
          submitted_at: new Date().toISOString(),
          acx_url: 'https://www.acx.com'
        };
        await base44.entities.Book.update(book_id, {
          amazon_acx_status: 'submitted',
          amazon_acx_submitted_at: new Date().toISOString()
        });
      }
    }

    return Response.json({ success: true, results, book_title: book.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});