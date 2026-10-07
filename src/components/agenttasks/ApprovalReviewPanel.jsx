import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Gavel, Check, X, FileText } from "lucide-react";
import AgentNameLink from "@/components/agents/AgentNameLink";

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
      {isAdmin && reviews.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Admin note (optional)" className="h-7 text-xs flex-1 min-w-[160px]" />
          <Button size="sm" disabled={!!busy} onClick={() => call("decide", "approve")} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
            {busy === "approve" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}Approve
          </Button>
          <Button size="sm" disabled={!!busy} onClick={() => call("decide", "reject")} className="h-7 text-xs bg-red-600 hover:bg-red-500 text-white">
            {busy === "reject" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <X className="w-3 h-3 mr-1" />}Reject
          </Button>
        </div>
      )}
    </div>
  );
}