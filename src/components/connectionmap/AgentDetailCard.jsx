import React from "react";
import { Badge } from "@/components/ui/badge";
import { X, Target, Cpu, Star, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS = {
  admin:       "bg-amber-500/15 border-amber-500/30 text-amber-300",
  executive:   "bg-blue-500/15 border-blue-500/30 text-blue-300",
  manager:     "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  specialist:  "bg-purple-500/15 border-purple-500/30 text-purple-300",
  advisor:     "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  maintenance: "bg-slate-500/15 border-slate-500/30 text-slate-300",
};

const PILLAR_COLORS = [
  "bg-amber-500/10 text-amber-400/80 border-amber-500/20",
  "bg-blue-500/10 text-blue-400/80 border-blue-500/20",
  "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20",
  "bg-purple-500/10 text-purple-400/80 border-purple-500/20",
];

export default function AgentDetailCard({ agent, onClose, connections }) {
  if (!agent) return null;

  return (
    <div className="bg-slate-900 border-l border-white/10 h-full overflow-y-auto flex flex-col" style={{ width: 320 }}>
      {/* Header */}
      <div className="relative p-5 border-b border-white/8">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          {agent.image ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10">
              <img src={agent.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-white/10">
              <span className="text-xl font-bold text-white/30">{agent.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{agent.name}</p>
            <p className="text-white/40 text-xs mt-0.5 leading-tight">{agent.title}</p>
            {agent.age && <p className="text-white/25 text-xs mt-0.5">Age {agent.age}</p>}
            <div className="flex gap-2 mt-2">
              <Badge className={cn("text-xs border capitalize", ROLE_COLORS[agent.role] || ROLE_COLORS.manager)}>
                {agent.role}
              </Badge>
              <Badge className={cn("text-xs border", agent.status === "active"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400")}>
                {agent.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Description */}
        {agent.description && (
          <p className="text-white/50 text-sm leading-relaxed">{agent.description}</p>
        )}

        {/* Mission */}
        {agent.mission && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Mission</p>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">{agent.mission}</p>
          </div>
        )}

        {/* Goals */}
        {agent.goals?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Goals</p>
            </div>
            <ul className="space-y-1.5">
              {agent.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/60 mt-1.5 shrink-0" />
                  <p className="text-white/40 text-xs leading-relaxed">{g}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pillars */}
        {agent.pillars?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Pillars</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.pillars.map((p, i) => (
                <span key={p} className={cn("text-xs px-2 py-0.5 rounded-full border", PILLAR_COLORS[i % PILLAR_COLORS.length])}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connections */}
        {connections?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Connected Agents</p>
            </div>
            <div className="space-y-1.5">
              {connections.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400/60 shrink-0" />
                  <div>
                    <p className="text-white/70 text-xs font-medium">{c.name}</p>
                    <p className="text-white/30 text-[10px]">{c.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personality */}
        {agent.personality && (
          <div className="bg-white/4 rounded-xl p-4 border border-white/8">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Personality</p>
            <p className="text-white/50 text-xs leading-relaxed italic">"{agent.personality}"</p>
          </div>
        )}
      </div>
    </div>
  );
}