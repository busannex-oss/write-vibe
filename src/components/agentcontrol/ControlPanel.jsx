import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PauseCircle, PlayCircle, Loader2 } from "lucide-react";

// Control: global pause/resume of queued agent work, plus pending-approval gate.
export default function ControlPanel() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data: counts } = useQuery({
    queryKey: ["agent-control-counts"],
    queryFn: async () => ({
      queued: await base44.entities.AgentTask.count({ status: "queued" }),
      paused: await base44.entities.AgentTask.count({ status: "paused" }),
      approval: await base44.entities.AgentTask.count({ status: "awaiting_approval" }),
    }),
  });
  const move = async (from, to) => {
    setBusy(true);
    let more = true;
    while (more) more = (await base44.entities.AgentTask.updateMany({ status: from }, { $set: { status: to } })).has_more;
    setBusy(false);
    qc.invalidateQueries();
  };
  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader><CardTitle className="text-white text-base">Control — human override</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button disabled={busy || !counts?.queued} onClick={() => move("queued", "paused")} className="bg-red-600 hover:bg-red-700 text-white">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PauseCircle className="w-4 h-4 mr-2" />}
          Pause all queued ({counts?.queued ?? "…"})
        </Button>
        <Button disabled={busy || !counts?.paused} onClick={() => move("paused", "queued")} variant="outline">
          <PlayCircle className="w-4 h-4 mr-2" /> Resume all paused ({counts?.paused ?? "…"})
        </Button>
        <Link to="/AgentTasks" className="text-amber-400 text-sm hover:underline">
          {counts?.approval ?? 0} high-risk actions awaiting approval →
        </Link>
      </CardContent>
    </Card>
  );
}