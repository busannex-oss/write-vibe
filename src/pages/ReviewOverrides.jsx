import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import OverrideRow from "@/components/overrides/OverrideRow";

const STUCK_TASK = ["awaiting_approval", "paused"];

export default function ReviewOverrides() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: sops = [], isLoading: l1 } = useQuery({
    queryKey: ["stuck-sops"], queryFn: () => base44.entities.SOP.filter({ status: "under_review" }, "updated_date", 200)
  });
  const { data: tasks = [], isLoading: l2 } = useQuery({
    queryKey: ["stuck-tasks"], queryFn: () => base44.entities.AgentTask.filter({ status: { $in: STUCK_TASK } }, "updated_date", 200)
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["stuck-sops"] }) && qc.invalidateQueries({ queryKey: ["stuck-tasks"] });
  const by = user?.full_name || "Founder";
  const at = () => new Date().toISOString();

  const decideSop = async (sop, accept) => {
    await base44.entities.SOP.update(sop.id, {
      status: accept ? "active" : "draft", review_stage: "decided",
      review_history: [...(sop.review_history || []), { decision: accept ? "accept" : "reject", version: sop.version || 1, by, at: at(), note: "Founder manual override" }]
    });
    refresh();
  };
  const decideTask = async (task, accept) => {
    await base44.entities.AgentTask.update(task.id, {
      status: accept ? "approved" : "stopped", consensus: accept ? "accept" : "reject",
      history: [...(task.history || []), { at: at(), by, event: accept ? "Force-approved by founder override" : "Rejected by founder override" }]
    });
    refresh();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Review Overrides</h1>
          <p className="text-sm text-white/50">Everything stuck in review. Force-approve or reject so nothing stays pending.</p>
        </div>
      </div>
      <Section title={`SOPs under review (${sops.length})`} loading={l1} empty="No SOPs are stuck.">
        {sops.map((s) => (
          <OverrideRow key={s.id} title={s.title} status={s.review_stage || "under_review"} subtitle={`v${s.version || 1}`}
            since={s.updated_date} onApprove={() => decideSop(s, true)} onReject={() => decideSop(s, false)} />
        ))}
      </Section>
      <Section title={`Tasks awaiting approval (${tasks.length})`} loading={l2} empty="No tasks are stuck.">
        {tasks.map((t) => (
          <OverrideRow key={t.id} title={t.title} status={t.status} subtitle={t.agent_name}
            since={t.updated_date} onApprove={() => decideTask(t, true)} onReject={() => decideTask(t, false)} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, loading, empty, children }) {
  const has = React.Children.count(children) > 0;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">{title}</h2>
      {loading ? <p className="text-white/40 text-sm">Loading…</p> : has ? children : <p className="text-white/40 text-sm">{empty}</p>}
    </section>
  );
}