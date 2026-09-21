import React from "react";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PopularCategoriesList({ posts, activeTag, onSelect }) {
  const counts = {};
  (posts || []).forEach((p) => (p.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (top.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-amber-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Popular categories</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeTag && (
          <button
            onClick={() => onSelect(null)}
            className="px-2.5 py-1 rounded-full text-xs border border-white/15 text-white/50 hover:text-white"
          >
            Clear
          </button>
        )}
        {top.map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => onSelect(activeTag === tag ? null : tag)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs border transition-colors",
              activeTag === tag
                ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            )}
          >
            {tag} <span className="text-white/30">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}