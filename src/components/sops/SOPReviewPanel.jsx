import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewDecisionBar from "@/components/review/ReviewDecisionBar";
import { format } from "date-fns";

const COLORS = { accept: "text-emerald-400", reject: "text-red-400", refine: "text-amber-400", assign: "text-sky-400" };
const LABELS = { accept: "Accepted", reject: "Rejected", refine: "Sent for refinement", assign: "Assigned" };

export default function SOPReviewPanel({ sop, onRefresh }) {
  const history = [...(sop.review_history || [])].reverse();
  const decide = async (decision, { note, assignee }) => {
    await base44.functions.invoke("sops", { action: "review", id: sop.id, decision, note, assignee });
    onRefresh?.();
  };

  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader className="pb-3"><CardTitle className="text-white text-base">Review — v{sop.version}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ReviewDecisionBar onDecide={decide} />
        {history.length === 0 ? (
          <p className="text-white/40 text-sm">This version has not been reviewed yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="text-sm border-l-2 border-white/10 pl-3">
                <p className={COLORS[h.decision]}>
                  {LABELS[h.decision]}{h.assignee ? ` to ${h.assignee}` : ""} <span className="text-white/40">· v{h.version}</span>
                </p>
                {h.note && <p className="text-white/70">{h.note}</p>}
                <p className="text-white/30 text-xs">{h.by} · {h.at && format(new Date(h.at), "MMM d, yyyy h:mm a")}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}