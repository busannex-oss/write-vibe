import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Pencil, UserPlus, Loader2 } from "lucide-react";
import { AGENT_DIRECTORY } from "@/lib/agentDirectory";

const DEPARTMENTS = [...new Set(AGENT_DIRECTORY.map((a) => a.department).filter(Boolean))];

// Resolves "agent:key" or "dept:Name" to an agent (department → its first listed agent).
const resolve = (value) => {
  const [type, id] = value.split(":");
  const agent = type === "agent" ? AGENT_DIRECTORY.find((a) => a.key === id) : AGENT_DIRECTORY.find((a) => a.department === id);
  return agent && { agent_key: agent.key, agent_name: agent.name, department: type === "dept" ? id : agent.department };
};

// Standard review options for anything awaiting the founder's attention:
// onDecide("accept" | "reject" | "refine" | "assign", { note, assignee })
export default function ReviewDecisionBar({ onDecide }) {
  const [mode, setMode] = useState(null);
  const [note, setNote] = useState("");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(null);

  const run = async (decision, extra = {}) => {
    setBusy(decision);
    await onDecide(decision, { note, ...extra });
    setBusy(null); setMode(null); setNote(""); setTarget("");
  };
  const icon = (d, I) => (busy === d ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <I className="w-3 h-3 mr-1" />);
  const b = "h-7 text-xs text-white";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" disabled={!!busy} onClick={() => run("accept")} className={`${b} bg-emerald-600 hover:bg-emerald-500`}>{icon("accept", Check)}Accept</Button>
        <Button size="sm" disabled={!!busy} onClick={() => run("reject")} className={`${b} bg-red-600 hover:bg-red-500`}>{icon("reject", X)}Reject</Button>
        <Button size="sm" disabled={!!busy} onClick={() => setMode(mode === "refine" ? null : "refine")} className={`${b} bg-amber-600 hover:bg-amber-500`}><Pencil className="w-3 h-3 mr-1" />Refine</Button>
        <Button size="sm" disabled={!!busy} onClick={() => setMode(mode === "assign" ? null : "assign")} className={`${b} bg-sky-600 hover:bg-sky-500`}><UserPlus className="w-3 h-3 mr-1" />Assign</Button>
      </div>
      {mode && (
        <div className="flex flex-wrap gap-2 items-center">
          {mode === "assign" && (
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="h-7 rounded px-1 text-xs">
              <option value="">Choose agent or department…</option>
              <optgroup label="Departments">{DEPARTMENTS.map((d) => <option key={d} value={`dept:${d}`}>{d} department</option>)}</optgroup>
              <optgroup label="Agents">{AGENT_DIRECTORY.map((a) => <option key={a.key} value={`agent:${a.key}`}>{a.name} — {a.role}</option>)}</optgroup>
            </select>
          )}
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === "refine" ? "What should change?" : "Instructions (optional)"} className="h-7 text-xs flex-1 min-w-[160px]" />
          <Button size="sm" disabled={!!busy || (mode === "refine" ? !note.trim() : !target)} onClick={() => run(mode, mode === "assign" ? { assignee: resolve(target) } : {})} className={`${b} bg-white/10`}>
            {icon(mode, Check)}Send
          </Button>
        </div>
      )}
    </div>
  );
}