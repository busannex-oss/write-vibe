import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, SkipForward, Check, Pencil, Zap } from "lucide-react";

const DONE = ["completed", "skipped", "stopped"];

export default function AgentTaskControls({ task, onChange, onRunNow, onEdit, running }) {
  const s = task.status;
  const btn = (label, Icon, fn, cls = "") => (
    <Button size="sm" variant="outline" onClick={fn} disabled={running} className={`h-7 border-white/15 text-white/70 text-xs ${cls}`}>
      <Icon className="w-3 h-3 mr-1" />{label}
    </Button>
  );
  if (DONE.includes(s)) return btn("Run again", Play, () => onChange({ status: "queued", output: "" }, "Re-queued"));
  return (
    <div className="flex flex-wrap gap-1.5">
      {s === "paused"
        ? btn("Resume", Play, () => onChange({ status: "queued" }, "Resumed"))
        : btn("Pause", Pause, () => onChange({ status: "paused" }, "Paused"))}
      {["queued", "approved", "failed"].includes(s) && btn("Run now", Zap, onRunNow)}
      {btn("Edit", Pencil, onEdit)}
      {btn("Skip", SkipForward, () => onChange({ status: "skipped" }, "Skipped"))}
      {btn("Stop", Square, () => onChange({ status: "stopped" }, "Stopped"), "text-red-300")}
    </div>
  );
}