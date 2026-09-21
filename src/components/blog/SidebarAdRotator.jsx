import React, { useState, useEffect } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { WRITEVIBE_ADS } from "@/lib/writeVibeAds";

export default function SidebarAdRotator({ intervalMs = 7000 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WRITEVIBE_ADS.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const ad = WRITEVIBE_ADS[i];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block p-5 bg-gradient-to-br ${ad.accent} transition-colors hover:bg-white/5`}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
          <Sparkles className="w-3 h-3" /> {ad.eyebrow}
        </div>
        <h4 className="mt-2 text-base font-semibold text-white leading-snug">{ad.headline}</h4>
        <p className="mt-2 text-xs text-white/60 leading-relaxed">{ad.body}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-300">
          {ad.cta} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </a>
      <div className="flex items-center justify-center gap-1.5 pb-3">
        {WRITEVIBE_ADS.map((a, idx) => (
          <button
            key={a.id}
            onClick={() => setI(idx)}
            aria-label={`Show promo ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-amber-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}