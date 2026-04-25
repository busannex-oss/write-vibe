import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, Shield, RefreshCw, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_CONFIG = {
  high:   { color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20",   icon: AlertTriangle },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: ShieldAlert },
  low:    { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: Shield }
};

const invoke = (action, extra = {}) => base44.functions.invoke("legalDocuments", { action, ...extra });

export default function LegalRiskPanel({ docType, riskAnalysis: initial, onUpdated, onClose }) {
  const [riskAnalysis, setRiskAnalysis] = useState(initial);
  const [regenerating, setRegenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const handleRegenerate = async () => {
    setRegenerating(true);
    const res = await invoke("regenerate_risk", { doc_type: docType });
    setRiskAnalysis(res.data.risk_analysis);
    onUpdated?.(res.data.risk_analysis);
    setRegenerating(false);
  };

  if (!riskAnalysis) return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /> Legal Risk Analysis</p>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-3 h-3" /></Button>
      </div>
      <p className="text-white/30 text-xs">No risk analysis yet. Generate a document first, or run analysis separately.</p>
      <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={regenerating}>
        {regenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
        Run Risk Analysis
      </Button>
    </div>
  );

  const overall = riskAnalysis.overall_risk || 'medium';
  const cfg = RISK_CONFIG[overall] || RISK_CONFIG.medium;
  const OIcon = cfg.icon;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-white font-semibold text-sm">Legal Risk Analysis</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", cfg.color, cfg.bg, cfg.border)}>
              {overall.toUpperCase()} RISK
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-6 text-xs text-white/40 hover:text-white" onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Refresh
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="w-3 h-3" /></Button>
          </div>
        </div>
        {riskAnalysis.summary && (
          <p className="text-white/50 text-xs mt-2 leading-relaxed">{riskAnalysis.summary}</p>
        )}
      </div>

      {/* Risk items */}
      <div className="divide-y divide-white/4">
        {(riskAnalysis.risks || []).map((risk, i) => {
          const rc = RISK_CONFIG[risk.risk_level] || RISK_CONFIG.medium;
          const RIcon = rc.icon;
          return (
            <div key={i} className="p-4">
              <button
                className="w-full flex items-start justify-between gap-3 text-left"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <RIcon className={cn("w-4 h-4 shrink-0 mt-0.5", rc.color)} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-xs font-semibold">{risk.section}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded border font-semibold", rc.color, rc.bg, rc.border)}>
                        {(risk.risk_level || 'medium').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{risk.description}</p>
                  </div>
                </div>
                {expanded === i ? <ChevronUp className="w-3 h-3 text-white/30 shrink-0 mt-1" /> : <ChevronDown className="w-3 h-3 text-white/30 shrink-0 mt-1" />}
              </button>
              {expanded === i && (
                <div className="mt-3 ml-6 space-y-2">
                  <p className="text-white/60 text-xs leading-relaxed">{risk.description}</p>
                  {risk.recommendation && (
                    <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                      <p className="text-green-400 text-xs font-semibold mb-1">Recommendation</p>
                      <p className="text-white/50 text-xs leading-relaxed">{risk.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}