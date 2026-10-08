import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { user = null; }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const books = await base44.asServiceRole.entities.Book.list('-updated_date', 1000);
    const now = new Date().toISOString();
    const file = new File(
      [JSON.stringify({ backed_up_at: now, books }, null, 2)],
      `book-drafts-backup-${now.slice(0, 10)}.json`,
      { type: 'application/json' }
    );
    const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    await base44.asServiceRole.entities.BookBackup.create({ file_uri, book_count: books.length, backed_up_at: now });

    return Response.json({ book_count: books.length, file_uri });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}