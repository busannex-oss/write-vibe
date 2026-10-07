import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const host = (r) => {
  if (!r) return "Direct / typed link";
  try { return new URL(r).hostname.replace(/^www\./, ""); } catch { return r; }
};

function RankList({ title, rows, empty }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2"><CardTitle className="text-white text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-white/40 text-sm py-6 text-center">{empty}</p>
        ) : rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm gap-3">
            <span className="text-white/80 truncate">{r.label}</span>
            <span className="text-white/50 whitespace-nowrap">{r.visits} visits · {r.readers} readers</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function rank(views, keyFn) {
  const map = {};
  views.forEach((v) => {
    const k = keyFn(v);
    map[k] = map[k] || { label: k, visits: 0, sessions: new Set() };
    map[k].visits++;
    if (v.session_id) map[k].sessions.add(v.session_id);
  });
  return Object.values(map)
    .map((r) => ({ label: r.label, visits: r.visits, readers: r.sessions.size }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);
}

export default function LandingPageTraffic({ views }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <RankList title="Visits by book landing page" rows={rank(views, (v) => v.book_title || "Untitled book")} empty="No landing page visits yet" />
      <RankList title="Top referring sites" rows={rank(views, (v) => host(v.referrer))} empty="No referrers recorded yet" />
    </div>
  );
}