import React from "react";
import { Progress } from "@/components/ui/progress";
import { Wand2 } from "lucide-react";

const toneFor = (score) =>
  score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";

export default function AuditScoreCard({ item, onImprove }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onImprove?.(item)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onImprove?.(item); } }}
      className="p-5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.07] transition-all text-left"
    >
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
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-amber-400">
        <Wand2 className="w-4 h-4" />
        Click to elevate this section
      </div>
    </div>
  );
}