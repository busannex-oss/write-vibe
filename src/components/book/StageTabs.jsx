import React from "react";
import { Check } from "lucide-react";

// Top-level stage tabs for the book editor: Write · Design · Publish · Market
export default function StageTabs({ stages, steps, book, activeStage, onSelect }) {
  return (
    <div className="flex gap-1 p-1 mb-6 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
      {stages.map((stage, i) => {
        const stageSteps = steps.filter(s => s.stage === stage.label);
        if (stageSteps.length === 0) return null;
        const done = stageSteps.filter(s => s.isDone(book)).length;
        const complete = done === stageSteps.length;
        const active = activeStage === stage.label;
        return (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.label)}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              active ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              active ? "bg-black/15" : complete ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10"
            }`}>
              {complete ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            {stage.label}
            <span className={`text-[10px] font-medium ${active ? "text-black/60" : "text-white/30"}`}>{done}/{stageSteps.length}</span>
          </button>
        );
      })}
    </div>
  );
}