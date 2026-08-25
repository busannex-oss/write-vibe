import React from "react";
import { Milestone, Check } from "lucide-react";

export default function MilestoneSummary({ milestones, books }) {
  const bookTitle = (id) => books.find((b) => b.id === id)?.title || "Unknown book";
  const completed = milestones.filter((m) => m.completed).length;
  const recent = [...milestones].slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Milestone className="w-4 h-4 text-purple-400" />
          Character Milestones
        </h3>
        <span className="text-xs text-white/40 tabular-nums">
          {completed}/{milestones.length} complete
        </span>
      </div>
      {milestones.length === 0 ? (
        <p className="text-sm text-white/40 py-4">No character milestones tracked yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((m) => (
            <div key={m.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  m.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/25"
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">
                  <span className="font-medium">{m.character_name}</span>
                  <span className="text-white/40"> — {m.title}</span>
                </p>
                <p className="text-[11px] text-white/30 truncate">
                  Ch. {m.chapter_number} · {bookTitle(m.book_id)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}