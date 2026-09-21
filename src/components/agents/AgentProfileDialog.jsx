import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bot, Fingerprint, Brain, Users, Sparkles } from "lucide-react";

export default function AgentProfileDialog({ agent, open, onOpenChange }) {
  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-950 border-white/10 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Agent Profile</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            {agent.portrait ? (
              <img src={agent.portrait} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-8 h-8 text-white/30" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white leading-tight">{agent.name}</p>
            <p className="text-sm text-amber-300">{agent.role}</p>
            <Badge className="bg-white/10 text-white/60 border-0 text-[10px] mt-2">{agent.department}</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">Unique identification number</p>
          </div>
          <p className="text-white font-mono text-lg tracking-wide">{agent.agent_id}</p>
          <p className="text-[11px] text-white/35 mt-1">System key: {agent.key}</p>
        </div>

        {agent.brain && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-3.5 h-3.5 text-white/40" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">How they think</p>
            </div>
            <p className="text-sm text-white/70">{agent.brain}</p>
          </div>
        )}

        {agent.hobbies?.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-white/40" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Interests</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.hobbies.map((h) => (
                <Badge key={h} className="bg-white/10 text-white/60 border-0 text-[10px]">{h}</Badge>
              ))}
            </div>
          </div>
        )}

        {agent.collaborates_with?.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-white/40" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Works closely with</p>
            </div>
            <ul className="space-y-1">
              {agent.collaborates_with.map((c) => (
                <li key={c} className="text-xs text-white/55">• {c}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}