import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, ChevronDown, ChevronUp, Loader2, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-400" },
  medium:   { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  low:      { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
};

/**
 * InlineRecommendations
 * Props:
 *   context (string) - what page/section these recs are for, e.g. "System Architecture"
 *   contextData (object) - optional extra data to include in the AI prompt
 *   storageKey (string) - localStorage key to cache recommendations
 */
export default function InlineRecommendations({ context, contextData = {}, storageKey }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(null);
  const [dismissed, setDismissed] = useState({});

  const cacheKey = storageKey || `recs_${context.replace(/\s+/g, "_").toLowerCase()}`;

  // Load from cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { recs: cachedRecs, ts } = JSON.parse(cached);
        // Use cache if less than 1 hour old
        if (Date.now() - ts < 3600000) setRecs(cachedRecs);
      }
      const cachedDismissed = localStorage.getItem(`${cacheKey}_dismissed`);
      if (cachedDismissed) setDismissed(JSON.parse(cachedDismissed));
    } catch {}
  }, [cacheKey]);

  const generate = async () => {
    setLoading(true);
    setOpen(true);
    const contextSummary = Object.entries(contextData)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 300) : String(v).slice(0, 300)}`)
      .join('\n');

    const result = await ai.InvokeLLM({
      prompt: `You are an expert advisor for a professional AI-powered book publishing platform called Write Vibe.

Context: The user is viewing the "${context}" section of their platform admin dashboard.
${contextSummary ? `\nCurrent data context:\n${contextSummary}` : ''}

Generate 4-6 specific, actionable, high-value recommendations to improve this section.
Each recommendation should be concise (1-2 sentences), immediately actionable, and tailored to the "${context}" area.

Prioritize by impact: at least one critical/high priority item.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                action: { type: "string" }
              }
            }
          }
        }
      }
    });

    const newRecs = result?.recommendations || [];
    setRecs(newRecs);
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ recs: newRecs, ts: Date.now() }));
    } catch {}
    setLoading(false);
  };

  const dismiss = (id) => {
    const updated = { ...dismissed, [id]: true };
    setDismissed(updated);
    try { localStorage.setItem(`${cacheKey}_dismissed`, JSON.stringify(updated)); } catch {}
  };

  const undismissAll = () => {
    setDismissed({});
    try { localStorage.removeItem(`${cacheKey}_dismissed`); } catch {}
  };

  const visible = (recs || []).filter(r => !dismissed[r.id]);
  const dismissedCount = (recs || []).filter(r => dismissed[r.id]).length;

  return (
    <div className="mb-6">
      {/* Trigger bar */}
      <button
        onClick={() => {
          if (!recs && !loading) generate();
          else setOpen(o => !o);
        }}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 hover:bg-amber-500/12 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left">
            <span className="text-amber-300 font-medium text-sm">AI Recommendations</span>
            {recs && (
              <span className="ml-2 text-amber-400/50 text-xs">
                {visible.length} active{dismissedCount > 0 ? ` · ${dismissedCount} dismissed` : ''}
              </span>
            )}
          </div>
          {!recs && !loading && (
            <span className="text-amber-400/50 text-xs ml-1">· Click to generate</span>
          )}
          {loading && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin ml-1" />}
        </div>
        <div className="flex items-center gap-2">
          {recs && (
            <button
              onClick={(e) => { e.stopPropagation(); generate(); }}
              className="p-1 rounded hover:bg-amber-500/20 text-amber-400/50 hover:text-amber-400 transition-colors"
              title="Refresh recommendations"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-amber-400/60" /> : <ChevronDown className="w-4 h-4 text-amber-400/60" />}
        </div>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 rounded-xl border border-white/8 bg-slate-900/60 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-3 p-5">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div>
                <p className="text-white/70 text-sm font-medium">Analyzing {context}...</p>
                <p className="text-white/30 text-xs">Generating personalized recommendations</p>
              </div>
            </div>
          ) : visible.length === 0 && recs ? (
            <div className="p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-sm font-medium">All recommendations addressed!</p>
              {dismissedCount > 0 && (
                <button onClick={undismissAll} className="text-white/30 text-xs mt-2 hover:text-white/60 underline">
                  Show {dismissedCount} dismissed
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {visible.map((rec) => {
                const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
                return (
                  <div key={rec.id} className="p-4 flex items-start gap-3 hover:bg-white/3 transition-colors group/rec">
                    <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-white font-medium text-sm">{rec.title}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium capitalize", cfg.bg, cfg.color)}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{rec.description}</p>
                      {rec.action && (
                        <p className="text-amber-400/70 text-xs mt-1 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          {rec.action}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismiss(rec.id)}
                      className="shrink-0 text-white/15 hover:text-white/50 text-xs opacity-0 group-hover/rec:opacity-100 transition-all mt-0.5 px-2 py-1 rounded hover:bg-white/5"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {dismissedCount > 0 && (
                <div className="px-4 py-2 text-center">
                  <button onClick={undismissAll} className="text-white/25 text-xs hover:text-white/50 underline">
                    Show {dismissedCount} dismissed recommendation{dismissedCount > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}