import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { STATUS_STYLES } from "@/lib/agentTasks";
import { AGENT_DIRECTORY } from "@/lib/agentDirectory";
import AgentTaskControls from "./AgentTaskControls";
import ApprovalReviewPanel from "./ApprovalReviewPanel";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AgentTaskCard({ task, onChange, onRunNow, running }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.instructions || "");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const reassign = (e) => {
    const a = AGENT_DIRECTORY.find((x) => x.key === e.target.value);
    onChange({ agent_key: a.key, agent_name: a.name }, `Reassigned to ${a.name}`);
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white font-medium">{task.title}</p>
          <p className="text-xs text-white/40 capitalize">{task.area} · {task.action_type}</p>
        </div>
        <div className="flex items-center gap-2">
          {task.risk === "high" && <Badge className="bg-amber-500/15 text-amber-300"><ShieldAlert className="w-3 h-3 mr-1" />Needs approval</Badge>}
          <Badge className={STATUS_STYLES[task.status]}>{running ? "running" : task.status.replace("_", " ")}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/50">
        Assigned to
        <select value={task.agent_key || ""} onChange={reassign} className="h-7 rounded px-1 text-xs">
          {AGENT_DIRECTORY.map((a) => <option key={a.key} value={a.key}>{a.name} — {a.role}</option>)}
        </select>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
          <Button size="sm" className="bg-amber-500 text-slate-950" onClick={() => { onChange({ instructions: text }, "Instructions edited"); setEditing(false); }}>Save</Button>
        </div>
      ) : task.instructions && <p className="text-sm text-white/60">{task.instructions}</p>}
      {task.error && <p className="text-xs text-red-300">{task.error}</p>}
      {task.output && (
        <div>
          <button onClick={() => setOpen(!open)} className="text-xs text-amber-400 flex items-center gap-1">
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}Agent result
          </button>
          {open && <div className="prose prose-invert prose-sm max-w-none mt-2"><ReactMarkdown>{task.output}</ReactMarkdown></div>}
        </div>
      )}
      {(task.status === "awaiting_approval" || task.reviews?.length > 0) && (
        <ApprovalReviewPanel task={task} isAdmin={user?.role === "admin"} onDone={() => qc.invalidateQueries({ queryKey: ["agent-tasks"] })} />
      )}
      <AgentTaskControls task={task} onChange={onChange} onRunNow={onRunNow} onEdit={() => setEditing(true)} running={running} />
    </div>
  );
}