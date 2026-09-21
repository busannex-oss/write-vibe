import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const scoreColor = (s) =>
  s >= 70 ? "text-emerald-300" : s >= 40 ? "text-amber-300" : "text-white/50";

export default function AttentionContactRow({ contact }) {
  const [open, setOpen] = useState(false);
  const factors = contact.score_factors || [];
  const score = contact.lead_score || 0;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 text-left">
        <div className="w-11 shrink-0 text-center">
          <p className={`text-lg font-bold ${scoreColor(score)}`}>{score}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{contact.name || contact.email}</p>
          <p className="text-xs text-white/45 truncate">{contact.attention_reason || contact.email}</p>
        </div>
        {contact.recommended_next_action && (
          <span className="hidden md:block text-xs text-amber-300/80 max-w-[220px] truncate">
            {contact.recommended_next_action}
          </span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1">
          {factors.length === 0 ? (
            <p className="text-xs text-white/40">No score breakdown yet — recalculate scores.</p>
          ) : (
            factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/55">{f.label}</span>
                <span className={f.points >= 0 ? "text-emerald-300" : "text-rose-300"}>
                  {f.points > 0 ? `+${f.points}` : f.points}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}