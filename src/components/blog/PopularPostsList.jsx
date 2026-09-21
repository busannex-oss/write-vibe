import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Flame, Eye } from "lucide-react";

export default function PopularPostsList({ posts }) {
  const top = [...(posts || [])]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  if (top.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-amber-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Most popular</p>
      </div>
      <ol className="space-y-3">
        {top.map((p, i) => (
          <li key={p.id} className="flex gap-3">
            <span className="text-amber-400/70 font-mono text-sm w-4 flex-shrink-0">{i + 1}</span>
            <div className="min-w-0">
              <Link
                to={`${createPageUrl("BlogPost")}?slug=${encodeURIComponent(p.slug || "")}`}
                className="text-sm text-white/80 hover:text-amber-300 leading-snug block"
              >
                {p.title}
              </Link>
              <p className="flex items-center gap-1 text-[11px] text-white/35 mt-0.5">
                <Eye className="w-3 h-3" /> {p.view_count || 0} reads
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}