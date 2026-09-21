import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, Quote, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BloggerCard({ author }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex gap-4">
        <img src={author.portrait} alt={author.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-white font-semibold leading-tight">{author.name}</p>
          <p className="text-xs text-amber-400/80">{author.title}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{author.beat}</p>
        </div>
      </div>

      <p className="flex gap-2 mt-4 text-sm text-white/70 italic">
        <Quote className="w-4 h-4 text-amber-400/60 flex-shrink-0" />
        {author.tagline}
      </p>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
        >
          {open ? "Less" : "Meet the writer"}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>
        <Link
          to={`${createPageUrl("BlogAuthor")}?id=${author.id}`}
          className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300"
        >
          Full profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {open && (
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Background</p>
            <p className="text-white/60">{author.background}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Voice</p>
            <p className="text-white/60">{author.voice}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Strong opinions</p>
            <ul className="space-y-1">
              {author.opinions.map((o) => (
                <li key={o} className="text-white/60">— {o}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {author.signature_formats.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/55">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}