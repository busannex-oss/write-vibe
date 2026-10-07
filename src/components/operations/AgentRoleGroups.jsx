import React, { useState } from "react";
import { AGENT_DIRECTORY } from "@/lib/agentDirectory";
import AgentProfileDialog from "@/components/agents/AgentProfileDialog";
import { Bot } from "lucide-react";

// Teams roll up into a few clear roles
const ROLE_GROUPS = [
  { label: "Writing", teams: ["creative", "media"] },
  { label: "Marketing", teams: ["marketing", "client_experience"] },
  { label: "Operations", teams: ["executive", "operations", "engineering", "governance", "finance"] },
  { label: "Advisory", teams: ["advisory"] },
];

export default function AgentRoleGroups({ showFounderAgents }) {
  const [selected, setSelected] = useState(null);
  const agents = AGENT_DIRECTORY.filter((a) => a.key !== "personal_executive_assistant" || showFounderAgents);

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white">Your Agent Team</h2>
      <p className="text-white/40 text-sm mt-1 mb-4">Every assistant, grouped by role, with its team and governance level.</p>
      <div className="space-y-6">
        {ROLE_GROUPS.map((g) => {
          const list = agents.filter((a) => g.teams.includes(a.team_id));
          return (
            <div key={g.label}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/70 mb-2">{g.label} · {list.length}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {list.map((a) => (
                  <button key={a.key} onClick={() => setSelected(a)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-slate-900 hover:border-white/25 text-left">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                      {a.portrait ? <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" /> : <Bot className="w-4 h-4 text-white/40" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{a.name}</p>
                      <p className="text-[11px] text-white/40 truncate">{a.role} · {a.team}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded" title={a.governance_label}>{a.governance_level}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <AgentProfileDialog agent={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </section>
  );
}