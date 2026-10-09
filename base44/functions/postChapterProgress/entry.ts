import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { publishToSocial } from '../../shared/socialPublish.ts';

// Posts a book-progress update to the founder's social accounts when a chapter is newly finalized.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Posts go out from the founder's own accounts — only the founder's chapter saves trigger them
    if (!user || user.role !== 'admin') {
      return Response.json({ skipped: 'Only the founder\'s chapters are posted' }, { status: 403 });
    }

    const { book_id, previously_finalized = [] } = await req.json();
    const [book] = await base44.asServiceRole.entities.Book.filter({ id: book_id });
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const chapters = book.manuscript_chapters || [];
    const finalized = chapters.filter((c) => c.status === 'finalized');
    const newlyDone = finalized.filter((c) => !previously_finalized.includes(c.chapter_number));
    if (!newlyDone.length) return Response.json({ skipped: 'No newly finished chapter' });

    const total = Math.max(chapters.length, book.table_of_contents?.length || 0);
    const words = chapters.reduce((s, c) => s + (c.word_count || 0), 0);
    const done = newlyDone.map((c) => `Chapter ${c.chapter_number}${c.chapter_title ? `: ${c.chapter_title}` : ''}`).join(', ');

    const { caption } = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a short, warm, human social media post (under 600 characters, 2-3 relevant hashtags, no em-dashes) from an author sharing writing progress.
Book: "${book.title}"${book.category ? ` (${book.category})` : ''}.
Just finished: ${done}.
Progress: ${finalized.length} of ${total} chapters finished, about ${words.toLocaleString()} words written.
Do not reveal plot spoilers. Build anticipation for the release.`,
      response_json_schema: { type: 'object', properties: { caption: { type: 'string' } } }
    });

    const creds = await base44.asServiceRole.entities.SocialCredential.filter({ is_active: true });
    const platforms = [...new Set(creds.map((c) => c.platform))];
    if (!platforms.length) return Response.json({ skipped: 'No social accounts connected' });

    const imageUrl = book.front_cover_url || undefined;
    const result = await publishToSocial({ creds, caption, imageUrl, platforms });
    const ok = Object.keys(result.results || {}).length > 0;

    await base44.asServiceRole.entities.SocialPost.create({
      caption, image_url: imageUrl, platforms, book_id,
      status: ok ? 'posted' : 'failed',
      posted_at: ok ? new Date().toISOString() : undefined,
      post_results: JSON.stringify(result)
    });

    return Response.json({ caption, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});