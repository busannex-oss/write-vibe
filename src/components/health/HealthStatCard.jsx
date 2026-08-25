import React from "react";

export default function HealthStatCard({ icon: Icon, label, value, sub, tone = "amber" }) {
  const tones = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-white leading-none">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/40 mt-2">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}