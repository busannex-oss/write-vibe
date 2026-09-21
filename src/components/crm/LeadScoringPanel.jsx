import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge, RefreshCw, AlertTriangle, Eye, ShieldCheck } from "lucide-react";
import AttentionContactRow from "./AttentionContactRow";

const LEVELS = [
  { key: "urgent", label: "Needs attention now", icon: AlertTriangle, color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/30" },
  { key: "watch", label: "Keep an eye on", icon: Eye, color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/30" },
  { key: "healthy", label: "Healthy", icon: ShieldCheck, color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/30" }
];

export default function LeadScoringPanel({ contacts = [], onDone }) {
  const [scoring, setScoring] = useState(false);
  const [level, setLevel] = useState("urgent");

  const groups = useMemo(() => {
    const g = { urgent: [], watch: [], healthy: [] };
    contacts.forEach((c) => {
      const key = c.attention_level || "healthy";
      if (g[key]) g[key].push(c);
    });
    Object.values(g).forEach((list) => list.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0)));
    return g;
  }, [contacts]);

  const scored = contacts.filter((c) => c.score_updated_at).length;
  const avg = contacts.length
    ? Math.round(contacts.reduce((s, c) => s + (c.lead_score || 0), 0) / contacts.length)
    : 0;

  const runScoring = async () => {
    setScoring(true);
    await base44.functions.invoke("scoreLeads", {});
    setScoring(false);
    onDone?.();
  };

  const list = groups[level] || [];

  return (
    <Card className="bg-white/5 border-white/10 mb-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" /> Lead Scoring
          </CardTitle>
          <p className="text-sm text-white/50 mt-1">
            Scores are calculated from membership, newsletter activity, recency and nurture history.
            {" "}Average score {avg} · {scored} of {contacts.length} scored.
          </p>
        </div>
        <Button onClick={runScoring} disabled={scoring} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${scoring ? "animate-spin" : ""}`} />
          {scoring ? "Scoring..." : "Recalculate scores"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              className={`rounded-xl border p-3 text-left transition-all ${l.bg} ${level === l.key ? "ring-1 ring-white/30" : "opacity-70 hover:opacity-100"}`}
            >
              <l.icon className={`w-4 h-4 ${l.color}`} />
              <p className="text-2xl font-bold text-white mt-1">{groups[l.key].length}</p>
              <p className="text-xs text-white/50">{l.label}</p>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-white/40 py-4 text-center">
            {scored === 0 ? "Run “Recalculate scores” to rank your contacts." : "Nobody in this group right now."}
          </p>
        ) : (
          <div className="space-y-2">
            {list.slice(0, 10).map((c) => (
              <AttentionContactRow key={c.id} contact={c} />
            ))}
            {list.length > 10 && (
              <p className="text-xs text-white/40 pt-1">+ {list.length - 10} more in this group</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}