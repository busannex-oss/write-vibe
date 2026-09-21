import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: 'bookId required' }, { status: 400 });
    }

    // Service role bypasses ALL RLS — required for public book website access
    let book = null;
    try {
      const books = await base44.asServiceRole.entities.Book.filter({ id: bookId });
      book = books?.[0] || null;
    } catch (e) {
      return Response.json({ error: 'Book not found', detail: e.message }, { status: 404 });
    }

    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    const authorEmail = book.created_by;

    // Only books the author has intentionally made public may be served here.
    const siteStatus = book.website_config?.status;
    const isPublic = book.status === 'published' || siteStatus === 'live' || siteStatus === 'coming_soon';
    if (!isPublic) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    // Allowlist of public-safe fields — never expose manuscripts, outlines,
    // saved drafts or internal character notes.
    book = {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle,
      status: book.status,
      category: book.category,
      subcategory: book.subcategory,
      subjects: book.subjects || [],
      plot_summary: book.plot_summary || null,
      book_summary: book.book_summary || null,
      table_of_contents: book.table_of_contents || [],
      characters: (book.characters || []).map(c => ({
        name: c?.name || null,
        role: c?.role || null,
        description: c?.description || null,
        image_url: c?.image_url || null
      })),
      front_cover_url: book.front_cover_url || null,
      author_logo_url: book.author_logo_url || null,
      author_tagline: book.author_tagline || null,
      logo_overlay: book.logo_overlay || null,
      back_cover_url: book.back_cover_url || null,
      author_photo_url: book.author_photo_url || null,
      video_commercial_url: book.video_commercial_url || null,
      audiobook_url: book.audiobook_url || null,
      website_config: book.website_config || null,
      selected_bookstores: book.selected_bookstores || [],
      social_media_links: book.social_media_links || null,
      amazon_asin: book.amazon_asin || null
    };

    // Fetch author profile
    let author = null;
    if (authorEmail) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: authorEmail });
        const found = users?.[0];
        // Only expose public profile fields — never the full User record
        author = found ? {
          full_name: found.full_name || null,
          author_bio: found.author_bio || null,
          author_photo_url: found.author_photo_url || null,
          website_title: found.website_title || null,
          social_media_links: found.social_media_links || null
        } : null;
      } catch (_) {}
    }

    // Fetch approved reviews
    let reviews = [];
    try {
      const allReviews = await base44.asServiceRole.entities.Review.filter({ book_id: bookId });
      reviews = allReviews.filter(r => r.status === 'approved');
    } catch (_) {}

    return Response.json({ book, author, reviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});