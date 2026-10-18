import React from "react";

const COLORS = { accept: "text-emerald-400", reject: "text-red-400", refine: "text-amber-400" };

export default function SOPVoteList({ title, votes }) {
  if (!votes?.length) return null;
  const tally = ["accept", "reject", "refine"].map((d) => `${votes.filter((v) => v.decision === d).length} ${d}`).join(" · ");
  return (
    <div className="space-y-2">
      <p className="text-white/60 text-xs uppercase tracking-wider">{title} <span className="normal-case text-white/40">({tally})</span></p>
      {votes.map((v) => (
        <div key={v.member} className="text-sm border-l-2 border-white/10 pl-3">
          <p className="text-white">{v.member} — <span className={COLORS[v.decision]}>{v.decision?.toUpperCase()}</span></p>
          <p className="text-white/60">{v.rationale}</p>
          {v.changes && <p className="text-amber-300/80 text-xs mt-0.5">Changes: {v.changes}</p>}
        </div>
      ))}
    </div>
  );
}