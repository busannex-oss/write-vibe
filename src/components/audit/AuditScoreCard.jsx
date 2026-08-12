import React from "react";
import { Progress } from "@/components/ui/progress";

const toneFor = (score) =>
  score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";

export default function AuditScoreCard({ item }) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-white font-semibold">{item.section}</h3>
          <p className="text-sm text-white/50 mt-1">{item.assessment}</p>
        </div>
        <div className={`text-3xl font-bold ${toneFor(item.score)}`}>{item.score}</div>
      </div>
      <Progress value={item.score} className="h-1.5 mb-4" />
      {item.strengths?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wider text-emerald-400/70 mb-1">Strengths</p>
          <ul className="text-sm text-white/60 list-disc pl-5 space-y-1">
            {item.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {item.recommendations?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-amber-400/70 mb-1">Recommendations</p>
          <ul className="text-sm text-white/60 list-disc pl-5 space-y-1">
            {item.recommendations.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}