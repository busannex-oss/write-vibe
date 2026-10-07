import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Loader2 } from "lucide-react";
import AgentTaskForm from "@/components/agenttasks/AgentTaskForm";
import AgentTaskCard from "@/components/agenttasks/AgentTaskCard";
import { logEvent } from "@/lib/agentTasks";
import ActiveTasksPanel from "@/components/agenttasks/ActiveTasksPanel";

export default function AgentTasks() {
  const qc = useQueryClient();
  const [runningId, setRunningId] = useState(null);
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["agent-tasks"],
    queryFn: () => base44.entities.AgentTask.list("-created_date", 100),
    refetchInterval: 15000
  });
  const { data: books = [] } = useQuery({ queryKey: ["agent-task-books"], queryFn: () => base44.entities.Book.list("-updated_date", 100) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["agent-tasks"] });
  const by = user?.full_name || "You";

  const create = async (data) => {
    await base44.entities.AgentTask.create({ ...data, owner_email: user?.email, history: [{ at: new Date().toISOString(), event: "Assigned", by }] });
    refresh();
  };
  const change = async (task, patch, event) => {
    await base44.entities.AgentTask.update(task.id, { ...patch, history: logEvent(task, event, by) });
    refresh();
  };
  const runNow = async (task) => {
    setRunningId(task.id);
    await base44.functions.invoke("runAgentTasks", { taskId: task.id });
    setRunningId(null);
    refresh();
  };

  const pending = tasks.filter((t) => t.status === "awaiting_approval").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-amber-400" />Agent Tasks</h1>
        <p className="text-white/40 text-sm mt-1">
          Your agents work through these on their own every 15 minutes. Publishing, emailing readers and spending money always wait for your approval. You can pause, stop, edit, skip or reassign anything.
        </p>
        {pending > 0 && <p className="text-amber-300 text-sm mt-2">{pending} task{pending > 1 ? "s" : ""} waiting for your approval</p>}
      </div>
      <ActiveTasksPanel tasks={tasks} onChange={change} runningId={runningId} />
      <AgentTaskForm books={books} onCreate={create} />
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-white/40 py-12 text-sm">No tasks yet. Assign your first one above.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <AgentTaskCard key={t.id} task={t} running={runningId === t.id}
              onChange={(patch, event) => change(t, patch, event)} onRunNow={() => runNow(t)} />
          ))}
        </div>
      )}
    </div>
  );
}