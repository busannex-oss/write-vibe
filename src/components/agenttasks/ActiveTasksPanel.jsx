import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, SkipForward, Activity } from "lucide-react";
import { AGENT_DIRECTORY } from "@/lib/agentDirectory";

const ACTIVE = ["queued", "running", "approved", "awaiting_approval"];

export default function ActiveTasksPanel({ tasks, onChange, runningId }) {
  const active = tasks.filter((t) => ACTIVE.includes(t.status) || t.id === runningId);

  return (
    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-400" />Control panel — active work ({active.length})
      </h2>
      {active.length === 0 ? (
        <p className="text-xs text-white/40">No agent is working on anything right now.</p>
      ) : active.map((t) => (
        <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-white/5">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{t.title}</p>
            <p className="text-xs text-white/40">{t.id === runningId || t.status === "running" ? "Working now" : t.status.replace("_", " ")}</p>
          </div>
          <select value={t.agent_key || ""} className="h-7 rounded px-1 text-xs sm:w-52"
            onChange={(e) => {
              const a = AGENT_DIRECTORY.find((x) => x.key === e.target.value);
              onChange(t, { agent_key: a.key, agent_name: a.name }, `Reassigned to ${a.name}`);
            }}>
            {AGENT_DIRECTORY.map((a) => <option key={a.key} value={a.key}>{a.name} — {a.role}</option>)}
          </select>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs border-white/15 text-white/70" onClick={() => onChange(t, { status: "paused" }, "Paused")}>
              <Pause className="w-3 h-3 mr-1" />Pause
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-white/15 text-white/70" onClick={() => onChange(t, { status: "skipped" }, "Skipped")}>
              <SkipForward className="w-3 h-3 mr-1" />Skip
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}