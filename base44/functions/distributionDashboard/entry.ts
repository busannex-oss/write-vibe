import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function validateKDP(book) {
  const errors = [];
  const warnings = [];

  if (!book.title || book.title === 'Untitled Book') errors.push('Missing book title');
  if (!book.book_summary && !book.plot_summary) errors.push('Missing book description (required for KDP listing)');
  if (!book.category) errors.push('Missing primary category/genre');
  if (!book.front_cover_url) errors.push('Missing front cover image');
  if (!book.formatted_manuscript && !book.manuscript_chapters?.some(c => c?.content)) errors.push('No manuscript content found');

  const subjects = book.subjects || [];
  if (subjects.length === 0) warnings.push('No keywords set — add up to 7 keywords to improve discoverability');
  if (subjects.length < 3) warnings.push(`Only ${subjects.length} keyword(s) set — Amazon allows 7`);
  if (!book.subtitle) warnings.push('No subtitle — subtitles improve search ranking');
  if (!book.target_audience) warnings.push('Target audience not defined');
  if (!book.amazon_asin) warnings.push('No ASIN assigned yet — will be assigned after first submission');

  const wordCount = book.manuscript_chapters?.reduce((s, c) => s + (c?.word_count || 0), 0) || 0;
  if (wordCount < 2500) warnings.push(`Manuscript appears short (${wordCount} words) — KDP minimum is ~2,500 words`);

  return { errors, warnings, word_count: wordCount };
}

function validateACX(book) {
  const errors = [];
  const warnings = [];

  if (!book.title || book.title === 'Untitled Book') errors.push('Missing book title');
  if (!book.audiobook_url) errors.push('No audiobook file uploaded');
  if (!book.book_summary && !book.plot_summary) errors.push('Missing book description (required for ACX listing)');
  if (!book.front_cover_url) errors.push('Missing cover art (must be square, min 2400x2400px for ACX)');
  if (!book.audiobook_script && !book.manuscript_chapters?.some(c => c?.content)) warnings.push('No manuscript/script found for narrator reference');
  if (!book.author_photo_url) warnings.push('Missing author photo — recommended for ACX profile');
  if (!book.audiobook_voice_style) warnings.push('No narration style specified');

  return { errors, warnings };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, book_id } = body;

    if (action === 'get_status') {
      // Fetch book
      const books = await base44.entities.Book.list();
      const book = books.find(b => b.id === book_id);
      if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

      const kdp = validateKDP(book);
      const acx = validateACX(book);

      // Fetch export log
      const logs = await base44.entities.DistributionLog.filter({ book_id });
      const sortedLogs = logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      return Response.json({
        success: true,
        kdp: {
          ...kdp,
          status: book.amazon_kdp_status || 'not_submitted',
          asin: book.amazon_asin || null,
          submitted_at: book.amazon_kdp_submitted_at || null,
          ready: kdp.errors.length === 0
        },
        acx: {
          ...acx,
          status: book.amazon_acx_status || 'not_submitted',
          submitted_at: book.amazon_acx_submitted_at || null,
          ready: acx.errors.length === 0
        },
        book: {
          title: book.title,
          category: book.category,
          subjects: book.subjects || [],
          subtitle: book.subtitle,
          has_cover: !!book.front_cover_url,
          has_manuscript: !!(book.formatted_manuscript || book.manuscript_chapters?.some(c => c?.content)),
          has_audiobook: !!book.audiobook_url,
          word_count: kdp.word_count
        },
        export_log: sortedLogs.slice(0, 20)
      });
    }

    if (action === 'log_export') {
      const { platform, action: exportAction, metadata_snapshot, errors, notes } = body;
      const log = await base44.entities.DistributionLog.create({
        book_id, platform, action: exportAction,
        status: errors?.length > 0 ? 'failed' : 'success',
        metadata_snapshot: metadata_snapshot || {},
        errors: errors || [],
        notes: notes || ''
      });
      return Response.json({ success: true, log });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});