import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import DecisionAuditEntry from "./DecisionAuditEntry";

export default function DecisionAuditLog() {
  const { data, isLoading } = useQuery({
    queryKey: ["decision-audit"],
    queryFn: async () => {
      const tasks = await base44.entities.AgentTask.list("-updated_date", 200);
      const decided = tasks.filter((t) => t.reviews?.length > 0);
      const minutes = await base44.entities.AdvisoryBoardMinutes.list("-meeting_date", 200);
      const byId = Object.fromEntries(minutes.map((m) => [m.id, m]));
      return decided.map((t) => ({ task: t, minutes: byId[t.minutes_id] }));
    },
  });

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white">Decision Audit Log</h2>
      <p className="text-white/40 text-sm mt-1 mb-4">Every agent decision: the original task, the votes cast, and the resulting change or document.</p>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      ) : data.length === 0 ? (
        <p className="text-white/40 text-sm">No agent decisions recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map(({ task, minutes }) => <DecisionAuditEntry key={task.id} task={task} minutes={minutes} />)}
        </div>
      )}
    </section>
  );
}