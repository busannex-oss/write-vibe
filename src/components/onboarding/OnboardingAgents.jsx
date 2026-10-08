import React from "react";
import { findAgent } from "@/lib/agentDirectory";
import { ONBOARDING_AGENTS } from "@/lib/memberOnboarding";

export default function OnboardingAgents() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {ONBOARDING_AGENTS.map(({ key, helps }) => {
        const a = findAgent(key);
        if (!a) return null;
        return (
          <div key={key} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center shrink-0">
              {a.portrait ? <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" /> : <span className="text-amber-400 font-semibold">{a.name[0]}</span>}
            </div>
            <div>
              <p className="font-semibold text-white">{a.name}</p>
              <p className="text-xs text-amber-400 mb-1">{a.role}</p>
              <p className="text-sm text-white/60">{helps}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}