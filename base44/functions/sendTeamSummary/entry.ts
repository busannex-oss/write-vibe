import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const PERIOD_DAYS = { daily: 1, weekly: 7, monthly: 30 };

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildEmail(freq, recentSops, recentDocs, recentAutoSops, periodStart, now) {
  const periodLabel = freq.charAt(0).toUpperCase() + freq.slice(1);
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const li = (html) => `<li>${html}</li>`;

  const sopsHtml = recentSops.length
    ? recentSops.map(s => li(`<strong>${esc(s.title)}</strong> — v${s.version || 1} · ${esc(s.status)} · updated ${fmtDate(s.updated_date || s.created_date)}`)).join("")
    : li("<em>No SOP updates this period.</em>");
  const docsHtml = recentDocs.length
    ? recentDocs.map(d => li(`<strong>${esc(d.title)}</strong> — v${d.version_number || 1} · ${esc(d.type)} · ${fmtDate(d.created_date)}`)).join("")
    : li("<em>No new AI-generated documents this period.</em>");
  const autoSopsHtml = recentAutoSops.length
    ? recentAutoSops.map(s => li(`${esc(s.title)} — generated ${fmtDate(s.created_date)}`)).join("")
    : li("<em>No new AI-generated SOPs this period.</em>");

  const subject = `${periodLabel} Team Summary — Write Vibe`;
  const body = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#1a1a1a;line-height:1.5;">
    <h2 style="color:#f59e0b;margin-bottom:4px;">${periodLabel} Team Summary</h2>
    <p style="color:#666;margin-top:0;">Covering ${fmtDate(periodStart)} – ${fmtDate(now)}</p>
    <h3 style="border-bottom:1px solid #eee;padding-bottom:4px;">Recently Updated SOPs (${recentSops.length})</h3>
    <ul>${sopsHtml}</ul>
    <h3 style="border-bottom:1px solid #eee;padding-bottom:4px;">New AI-Generated Documents (${recentDocs.length})</h3>
    <ul>${docsHtml}</ul>
    <h3 style="border-bottom:1px solid #eee;padding-bottom:4px;">New AI-Generated SOPs (${recentAutoSops.length})</h3>
    <ul>${autoSopsHtml}</ul>
    <p style="color:#888;font-size:12px;margin-top:24px;">View the full report anytime in your dashboard under Admin → Team Summary. You can change your delivery preferences there too.</p>
  </div>`;
  return { subject, body };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (caller?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const svc = base44.asServiceRole;

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    // Dry-run mode: returns the generated summary for the requested frequency without sending.
    const dryRun = payload.dry_run === true;
    const overrideFreq = payload.frequency; // for dry-run preview

    const now = new Date();
    const ctStr = now.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const ctDate = new Date(ctStr);
    const dayOfWeek = ctDate.getDay();
    const dayOfMonth = ctDate.getDate();
    const isMonday = dayOfWeek === 1;
    const isFirstOfMonth = dayOfMonth === 1;

    const todayFreqs = ["daily"];
    if (isMonday) todayFreqs.push("weekly");
    if (isFirstOfMonth) todayFreqs.push("monthly");

    // Fetch admin users + subscriptions
    const admins = await svc.entities.User.filter({ role: "admin" });
    const subs = await svc.entities.ReportSubscription.filter({});
    const subMap = {};
    for (const s of subs) subMap[s.user_email] = s.delivery_frequency || "weekly";

    // Fetch data once for each frequency we actually need to send today.
    const neededFreqs = dryRun && overrideFreq ? [overrideFreq] : todayFreqs;
    const dataCache = {};
    for (const freq of neededFreqs) {
      if (dataCache[freq]) continue;
      const days = PERIOD_DAYS[freq];
      const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const sops = await svc.entities.SOP.filter({}, "-updated_date", 300);
      const recentSops = sops.filter(s => new Date(s.updated_date || s.created_date) >= periodStart);
      const docs = await svc.entities.Document.filter({ book_id: "admin" }, "-created_date", 300);
      const recentDocs = docs.filter(d => new Date(d.created_date) >= periodStart);
      const recentAutoSops = sops.filter(s => s.auto_generated && new Date(s.created_date) >= periodStart);
      dataCache[freq] = { periodStart, recentSops, recentDocs, recentAutoSops };
    }

    if (dryRun) {
      const freq = overrideFreq || "weekly";
      const d = dataCache[freq] || { periodStart: new Date(now.getTime() - 7*86400000), recentSops: [], recentDocs: [], recentAutoSops: [] };
      return Response.json({
        status: "ok",
        dry_run: true,
        frequency: freq,
        period_start: d.periodStart,
        now,
        todayFreqs,
        sop_count: d.recentSops.length,
        doc_count: d.recentDocs.length,
        auto_sop_count: d.recentAutoSops.length,
        recent_sops: d.recentSops.map(s => ({ title: s.title, version: s.version, status: s.status, updated_date: s.updated_date })),
        recent_docs: d.recentDocs.map(d2 => ({ title: d2.title, type: d2.type, version_number: d2.version_number, created_date: d2.created_date })),
        recipient_count: admins.filter(a => {
          const f = subMap[a.email] || "weekly";
          return f !== "none" && (dryRun ? true : todayFreqs.includes(f));
        }).length
      });
    }

    let sentCount = 0;
    const errors = [];
    for (const admin of admins) {
      const email = admin.email;
      if (!email) continue;
      const freq = subMap[email] || "weekly";
      if (freq === "none") continue;
      if (!todayFreqs.includes(freq)) continue;

      const d = dataCache[freq];
      if (!d) continue;
      const { subject, body } = buildEmail(freq, d.recentSops, d.recentDocs, d.recentAutoSops, d.periodStart, now);
      try {
        await svc.integrations.Core.SendEmail({ to: email, subject, body });
        sentCount++;
      } catch (e) {
        errors.push({ email, error: e.message });
      }
    }

    return Response.json({ status: "ok", sent: sentCount, admins: admins.length, todayFreqs, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});