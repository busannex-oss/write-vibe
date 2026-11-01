import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Observability: last-24h action volume, errors, blocked calls and latency.
export default function ObservabilityStats() {
  const since = new Date(Date.now() - 86400000).toISOString();
  const { data } = useQuery({
    queryKey: ["agent-observability"],
    queryFn: () => base44.entities.SystemTrace.aggregate({ query: { created_date: { $gte: since } }, groupBy: "status", avg: ["duration_ms"] }),
  });
  const rows = data?.rows || [];
  const get = (s) => rows.find((r) => r.status === s)?.count || 0;
  const total = rows.reduce((n, r) => n + r.count, 0);
  const avg = rows.find((r) => r.status === "ok")?.avg_duration_ms;
  const stats = [
    ["Actions (24h)", total, "text-white"],
    ["Errors", get("error"), get("error") ? "text-red-400" : "text-white"],
    ["Blocked / rate-limited", get("blocked"), "text-amber-400"],
    ["Avg latency", avg ? `${Math.round(avg)} ms` : "—", "text-white"],
  ];
  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-white text-base">Observability — last 24 hours</CardTitle>
        <Link to="/SystemTraces" className="text-amber-400 text-sm hover:underline">Open traces</Link>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(([label, value, color]) => (
          <div key={label} className="rounded-xl bg-white/5 p-4">
            <p className="text-white/40 text-xs">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}