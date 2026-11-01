import React from "react";
import { Badge } from "@/components/ui/badge";

export default function MarketingPlanChannels({ channels = [] }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {channels.map((c, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white">{c.channel}</h4>
            {c.type && <Badge className="bg-amber-500/20 text-amber-300 border-0 capitalize">{c.type}</Badge>}
          </div>
          <p className="text-sm text-white/60">{c.why}</p>
          <ul className="text-sm text-white/80 list-disc pl-5 space-y-1">
            {(c.tactics || []).map((t, j) => <li key={j}>{t}</li>)}
          </ul>
          <div className="flex flex-wrap gap-3 text-xs text-white/50 pt-1">
            {c.cadence && <span>Cadence: {c.cadence}</span>}
            {c.kpi && <span>KPI: {c.kpi}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}