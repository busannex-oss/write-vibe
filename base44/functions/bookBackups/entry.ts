import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SYSTEM_FIELDS = ['id', 'created_date', 'updated_date', 'created_by', 'created_by_id', 'is_sample'];

async function loadBackup(base44, backupId) {
  const backup = await base44.asServiceRole.entities.BookBackup.get(backupId);
  const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: backup.file_uri, expires_in: 120 });
  const data = await (await fetch(signed_url)).json();
  return data.books || [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, backup_id, book_id } = await req.json();
    const books = await loadBackup(base44, backup_id);

    if (action === 'list') {
      return Response.json({
        books: books.map((b) => ({
          id: b.id, title: b.title, status: b.status, updated_date: b.updated_date,
          chapters: (b.manuscript_chapters || []).length
        }))
      });
    }

    if (action === 'restore') {
      const snapshot = books.find((b) => b.id === book_id);
      if (!snapshot) return Response.json({ error: 'Book not found in this backup' }, { status: 404 });
      const data = { ...snapshot };
      SYSTEM_FIELDS.forEach((f) => delete data[f]);
      await base44.asServiceRole.entities.Book.update(book_id, data);
      return Response.json({ restored: true, title: snapshot.title });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});