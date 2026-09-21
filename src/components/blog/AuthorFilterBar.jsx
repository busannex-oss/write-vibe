import React from "react";
import { BLOG_AUTHORS } from "@/lib/blogAuthors";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export default function AuthorFilterBar({ activeAuthor, onSelect }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-amber-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Browse by writer</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs border transition-colors",
            !activeAuthor
              ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white"
          )}
        >
          All writers
        </button>
        {BLOG_AUTHORS.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(activeAuthor === a.name ? null : a.name)}
            className={cn(
              "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs border transition-colors",
              activeAuthor === a.name
                ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            )}
          >
            <img src={a.portrait} alt="" className="w-6 h-6 rounded-full object-cover" />
            {a.name}
          </button>
        ))}
      </div>
    </div>
  );
}