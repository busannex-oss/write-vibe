import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function PEABriefingRow({ title, subtitle, meta, linkPage, urgent }) {
  const body = (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${urgent ? "bg-amber-400" : "bg-white/25"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 leading-snug">{title}</p>
        {subtitle && <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{subtitle}</p>}
        {meta && <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wide">{meta}</p>}
      </div>
      {linkPage && <ArrowRight className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />}
    </div>
  );

  return linkPage ? <Link to={createPageUrl(linkPage)}>{body}</Link> : body;
}