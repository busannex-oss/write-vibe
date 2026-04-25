import React from "react";
import { AlertTriangle, Activity, CheckCircle2, Clock, TrendingUp, Zap } from "lucide-react";

const scoreColor = (s) => s >= 80 ? "text-green-400" : s >= 60 ? "text-amber-400" : "text-red-400";
const scoreBg = (s) => s >= 80 ? "bg-green-500/10 border-green-500/20" : s >= 60 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
const scoreRing = (s) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";

export default function AuditDashboard({ doc, manifest }) {
  const meta = doc?.risk_analysis || {};
  const healthScore = meta.health_score || null;
  const redFlags = meta.red_flags || [];
  const activeCount = meta.active_count || manifest.filter(a => a.status === "active").length;
  const degradedCount = meta.degraded_count || manifest.filter(a => a.status === "degraded").length;
  const lastAudit = doc?.generated_at ? new Date(doc.generated_at).toLocaleString() : null;

  return (
    <div className="bg-slate-900 border border-white/8 rounded-2xl p-6 mb-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span className="text-white font-bold text-base">Live Agent Monitoring Dashboard</span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
        </div>
        {lastAudit && (
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Clock className="w-3.5 h-3.5" />
            Last audit: {lastAudit}
          </div>
        )}
      </div>

      {/* Main metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className={`rounded-xl border p-4 flex flex-col items-center justify-center ${healthScore ? scoreBg(healthScore) : 'bg-white/5 border-white/10'}`}>
          {healthScore ? (
            <>
              <span className={`text-4xl font-black tabular-nums ${scoreColor(healthScore)}`}>{healthScore}</span>
              <span className="text-white/50 text-xs mt-1 font-medium">Health Score</span>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${healthScore}%`, backgroundColor: scoreRing(healthScore) }} />
              </div>
            </>
          ) : (
            <span className="text-white/20 text-sm">Run audit first</span>
          )}
        </div>

        {/* Agents running */}
        <div className="bg-white/5 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-white/50 text-xs">Active Agents</span>
          </div>
          <span className="text-3xl font-black text-green-400 tabular-nums">{activeCount}</span>
          <p className="text-white/25 text-xs mt-0.5">of {manifest.length} registered</p>
        </div>

        {/* Degraded */}
        <div className={`border rounded-xl p-4 ${degradedCount > 0 ? 'bg-red-500/8 border-red-500/20' : 'bg-white/5 border-white/8'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${degradedCount > 0 ? 'text-red-400' : 'text-white/30'}`} />
            <span className="text-white/50 text-xs">Degraded</span>
          </div>
          <span className={`text-3xl font-black tabular-nums ${degradedCount > 0 ? 'text-red-400' : 'text-white/40'}`}>{degradedCount}</span>
          <p className="text-white/25 text-xs mt-0.5">require attention</p>
        </div>

        {/* Flags */}
        <div className={`border rounded-xl p-4 ${redFlags.length > 0 ? 'bg-orange-500/8 border-orange-500/20' : 'bg-white/5 border-white/8'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-4 h-4 ${redFlags.length > 0 ? 'text-orange-400' : 'text-white/30'}`} />
            <span className="text-white/50 text-xs">Red Flags</span>
          </div>
          <span className={`text-3xl font-black tabular-nums ${redFlags.length > 0 ? 'text-orange-400' : 'text-white/40'}`}>{redFlags.length}</span>
          <p className="text-white/25 text-xs mt-0.5">immediate action</p>
        </div>
      </div>

      {/* Red flags list */}
      {redFlags.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 space-y-2">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Red Flags Requiring Immediate Action
          </p>
          <ul className="space-y-1.5">
            {redFlags.map((f, i) => (
              <li key={i} className="text-red-300/80 text-xs flex items-start gap-2">
                <span className="text-red-500 mt-0.5 shrink-0">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Agent status pills */}
      <div>
        <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-2.5">All Registered Agents</p>
        <div className="flex flex-wrap gap-2">
          {manifest.map(a => (
            <span key={a.name} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              a.status === 'active' ? 'bg-green-500/10 border-green-500/25 text-green-400'
              : a.status === 'degraded' ? 'bg-red-500/10 border-red-500/25 text-red-400'
              : 'bg-white/5 border-white/10 text-white/30'
            }`}>
              {a.status === 'active' ? '✓' : '⚠'} {a.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}