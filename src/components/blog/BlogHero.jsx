import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Sparkles, Rss } from "lucide-react";

const HEADER_IMAGE = "https://media.base44.com/images/public/6975e45ac14c500ed1fcdcf2/28d715ad3_generated_image.png";

export default function BlogHero() {
  return (
    <div className="relative">
      <img src={HEADER_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
      <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
        <div className="flex items-center justify-between mb-10">
          <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
          <a
            href="/functions/blogRss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/20"
          >
            <Rss className="w-3.5 h-3.5" /> RSS feed
          </a>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-300">The Write Vibe Journal</span>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-white max-w-3xl">
          Stories, craft and the business of publishing
        </h1>
        <p className="text-white/60 mt-3 max-w-2xl">
          Practical writing and marketing lessons from authors building real audiences — plus behind-the-scenes looks at books in progress.
        </p>
      </div>
    </div>
  );
}