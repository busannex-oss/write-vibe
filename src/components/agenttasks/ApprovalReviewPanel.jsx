import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Gavel, Check, X, FileText } from "lucide-react";
import AgentNameLink from "@/components/agents/AgentNameLink";
import ReviewDecisionBar from "@/components/review/ReviewDecisionBar";
import { logEvent } from "@/lib/agentTasks";

const DECISION_STYLES = {
  accept: "text-emerald-300", reject: "text-red-300", refine: "text-amber-300",
  comment: "text-sky-300", recommend: "text-purple-300"
};

export default function ApprovalReviewPanel({ task, isAdmin, onDone }) {
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState("");
  const reviews = task.reviews || [];

  const call = async (action, decision) => {
    setBusy(decision || action);
    await base44.functions.invoke("reviewAgentTask", { action, taskId: task.id, decision, note });
    setBusy(null);
    onDone();
  };

  const decide = async (decision, { note: n, assignee }) => {
    if (decision === "accept" || decision === "reject") {
      await base44.functions.invoke("reviewAgentTask", { action: "decide", taskId: task.id, decision: decision === "accept" ? "approve" : "reject", note: n });
    } else {
      const event = decision === "refine" ? `Refinement requested: ${n}` : `Assigned to ${assignee.agent_name} (${assignee.department})`;
      await base44.entities.AgentTask.update(task.id, {
        status: "queued", output: "", reviews: [], consensus: "",
        ...(decision === "refine" ? { instructions: `${task.instructions || ""}\n\nRefinement: ${n}`.trim() } : { agent_key: assignee.agent_key, agent_name: assignee.agent_name, ...(n ? { instructions: `${task.instructions || ""}\n\n${n}`.trim() } : {}) }),
        history: logEvent(task, event, "Founder")
      });
    }
    onDone();
  };

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
      <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5" />Approval review</p>
      {reviews.length === 0 ? (
        <Button size="sm" variant="outline" disabled={!!busy || !isAdmin} onClick={() => call("review")} className="h-7 text-xs border-white/15 text-white/70">
          {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}Send to Alexandar & Rose
        </Button>
      ) : reviews.map((v) => (
        <div key={v.reviewer} className="text-xs space-y-0.5">
          <p><AgentNameLink name={v.reviewer} /> voted <span className={`font-bold uppercase ${DECISION_STYLES[v.decision]}`}>{v.decision}</span></p>
          <p className="text-white/60">{v.rationale}</p>
          <p className="text-white/40"><em>Recommends:</em> {v.recommendation}</p>
        </div>
      ))}
      {task.consensus && (
        <p className="text-xs text-white/70 flex items-center gap-1.5">
          {task.consensus === "split" ? "Reviewers split — your call." : <><FileText className="w-3 h-3 text-emerald-300" />Agreement reached ({task.consensus}). Minutes recorded.</>}
        </p>
      )}
      {isAdmin && task.status === "awaiting_approval" && <ReviewDecisionBar onDecide={decide} />}
    </div>
  );
}