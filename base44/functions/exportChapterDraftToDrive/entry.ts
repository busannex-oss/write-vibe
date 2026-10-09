import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const FOLDER_NAME = 'Write Vibe Chapter Drafts';
const DRIVE = 'https://www.googleapis.com/drive/v3/files';

// Exports the most recently saved chapter version of a book to the founder's Google Drive.
// Only runs for admin (founder) saves, since Drive is connected with the founder's account.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { book_id } = await req.json();
    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });

    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== 'admin') {
      return Response.json({ skipped: 'Only the founder\'s drafts are exported' }, { status: 403 });
    }

    const [book] = await base44.asServiceRole.entities.Book.filter({ id: book_id });
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const all = Object.values(book.chapter_versions || {}).flat();
    const latest = all.sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')))[0];
    if (!latest) return Response.json({ skipped: 'No saved versions' });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const auth = { Authorization: `Bearer ${accessToken}` };

    // Find or create the export folder (drive.file sees folders this app created)
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const found = await fetch(`${DRIVE}?q=${q}&fields=files(id)`, { headers: auth, signal: AbortSignal.timeout(15000) }).then(r => r.json());
    let folderId = found.files?.[0]?.id;
    if (!folderId) {
      const created = await fetch(DRIVE, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
        signal: AbortSignal.timeout(15000)
      }).then(r => r.json());
      folderId = created.id;
    }

    const stamp = (latest.saved_at || new Date().toISOString()).replace(/[:.]/g, '-');
    const fileName = `${book.title} - Ch ${latest.chapter_number} ${latest.chapter_title || ''} - ${stamp}.txt`.replace(/\s+/g, ' ');
    const text = `${book.title}\nChapter ${latest.chapter_number}: ${latest.chapter_title || ''}\nSaved: ${latest.saved_at || ''}${latest.note ? `\nNote: ${latest.note}` : ''}\n\n${latest.content || ''}`;

    const boundary = 'wv' + crypto.randomUUID();
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: fileName, parents: [folderId] })}\r\n--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}\r\n--${boundary}--`;
    const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
      signal: AbortSignal.timeout(30000)
    });
    const result = await upload.json();
    if (!upload.ok) return Response.json({ error: result.error?.message || 'Drive upload failed' }, { status: 502 });

    return Response.json({ exported: result.name, file_id: result.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}