import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewDecisionBar from "@/components/review/ReviewDecisionBar";
import SOPVoteList from "@/components/sops/SOPVoteList";
import { Loader2, Gavel } from "lucide-react";
import { format } from "date-fns";

const STAGES = {
  pending_board: "Pending — waiting for the Advisory Board",
  in_review: "Pending — Advisory Board is voting",
  awaiting_founder: "Alexandar Sterling and Rose McLaurin disagreed — your decision is needed",
  refining: "Sent back for refinement",
  decided: "Review complete",
};
const LABELS = { accept: "Accepted", reject: "Rejected", refine: "Refine", assign: "Assigned", split: "Split" };

export default function SOPReviewPanel({ sop, onRefresh }) {
  const [running, setRunning] = useState(false);
  const history = [...(sop.review_history || [])].reverse();
  const stage = sop.review_stage;

  const decide = async (decision, { note, assignee }) => {
    await base44.functions.invoke("sops", { action: "review", id: sop.id, decision, note, assignee });
    onRefresh?.();
  };
  const runNow = async () => {
    setRunning(true);
    await base44.functions.invoke("reviewSOPs", { id: sop.id });
    setRunning(false);
    onRefresh?.();
  };

  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader className="pb-3 flex-row items-center justify-between gap-2">
        <CardTitle className="text-white text-base">Advisory Board Review — v{sop.version}</CardTitle>
        {(!stage || stage === "pending_board" || stage === "refining") && (
          <Button size="sm" variant="outline" disabled={running} onClick={runNow}>
            {running ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Gavel className="w-3 h-3 mr-1" />}
            {running ? "Board voting…" : "Convene board now"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <p className={stage === "awaiting_founder" ? "text-amber-400 text-sm" : "text-white/60 text-sm"}>{STAGES[stage] || "Not yet submitted to the Advisory Board"}</p>
        {stage === "awaiting_founder" && <ReviewDecisionBar onDecide={decide} />}
        <SOPVoteList title="Final votes" votes={sop.final_votes} />
        <SOPVoteList title="Advisory Board votes" votes={sop.board_votes} />
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs uppercase tracking-wider">Decision log</p>
            {history.map((h, i) => (
              <div key={i} className="text-sm border-l-2 border-white/10 pl-3">
                <p className="text-white">{LABELS[h.decision]}{h.assignee ? ` to ${h.assignee}` : ""} <span className="text-white/40">· v{h.version}</span></p>
                {h.note && <p className="text-white/60">{h.note}</p>}
                <p className="text-white/30 text-xs">{h.by} · {h.at && format(new Date(h.at), "MMM d, yyyy h:mm a")}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}