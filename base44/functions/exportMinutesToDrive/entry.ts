import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FOLDER_NAME = 'Write Vibe Meeting Minutes';
const DRIVE = 'https://www.googleapis.com/drive/v3/files';
const KEY = 'minutes_drive_export';

// Exports meeting minutes to a Google Drive folder as Google Docs.
// { minutes_id } exports one (only if the toggle is on); { export_all: true } exports every record.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { minutes_id, export_all } = await req.json().catch(() => ({}));
    if (!minutes_id && !export_all) return Response.json({ error: 'minutes_id or export_all required' }, { status: 400 });

    const db = base44.asServiceRole.entities;
    const [setting] = await db.AppSetting.filter({ key: KEY });
    if (!setting?.enabled) return Response.json({ skipped: 'Drive export is turned off' });

    const records = export_all
      ? await db.AdvisoryBoardMinutes.list('-meeting_date', 200)
      : await db.AdvisoryBoardMinutes.filter({ id: minutes_id });
    if (!records.length) return Response.json({ error: 'Minutes not found' }, { status: 404 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const auth = { Authorization: `Bearer ${accessToken}` };

    let folderId = setting.folder_id;
    if (folderId) {
      const chk = await fetch(`${DRIVE}/${folderId}?fields=id,trashed`, { headers: auth, signal: AbortSignal.timeout(15000) });
      const f = chk.ok ? await chk.json() : null;
      if (!f || f.trashed) folderId = null;
    }
    if (!folderId) {
      const created = await fetch(DRIVE, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
        signal: AbortSignal.timeout(15000),
      }).then((r) => r.json());
      folderId = created.id;
      await db.AppSetting.update(setting.id, { folder_id: folderId });
    }

    const upload = async (m) => {
      const date = (m.meeting_date || m.created_date || '').slice(0, 10);
      const name = `${date} - ${m.meeting_title}`;
      const html = m.minutes_html || `<h1>${m.meeting_title}</h1><p>${m.executive_summary || ''}</p><p>${m.overall_assessment || ''}</p>`;
      const boundary = 'wv' + crypto.randomUUID();
      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [folderId], mimeType: 'application/vnd.google-apps.document' })}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n<html><body>${html}</body></html>\r\n--${boundary}--`;
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Drive upload failed');
      return name;
    };

    const exported = [];
    const failed = [];
    for (let i = 0; i < records.length; i += 6) {
      const results = await Promise.allSettled(records.slice(i, i + 6).map(upload));
      results.forEach((r) => (r.status === 'fulfilled' ? exported.push(r.value) : failed.push(r.reason.message)));
    }
    return Response.json({ exported: exported.length, failed, folder_id: folderId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}