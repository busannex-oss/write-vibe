import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, MessageSquare, CheckCircle2, Circle } from "lucide-react";

const TYPE_CONFIG = {
  introduction:   { label: "Intro",        bg: "bg-blue-500",    ring: "ring-blue-500/40",   dot: "#3b82f6" },
  growth:         { label: "Growth",       bg: "bg-emerald-500", ring: "ring-emerald-500/40", dot: "#10b981" },
  conflict:       { label: "Conflict",     bg: "bg-red-500",     ring: "ring-red-500/40",    dot: "#ef4444" },
  revelation:     { label: "Revelation",   bg: "bg-purple-500",  ring: "ring-purple-500/40", dot: "#a855f7" },
  transformation: { label: "Transform",    bg: "bg-amber-500",   ring: "ring-amber-500/40",  dot: "#f59e0b" },
  resolution:     { label: "Resolution",   bg: "bg-teal-500",    ring: "ring-teal-500/40",   dot: "#14b8a6" },
  arc_peak:       { label: "Arc Peak",     bg: "bg-orange-500",  ring: "ring-orange-500/40", dot: "#f97316" },
  advisory_review:{ label: "Adv. Review",  bg: "bg-indigo-500",  ring: "ring-indigo-500/40", dot: "#6366f1" },
};

export default function TimelineTrack({ milestone, onClick, isSelected, chapterWidth, startChapter = 1 }) {
  const cfg = TYPE_CONFIG[milestone.milestone_type] || TYPE_CONFIG.growth;
  // Position within visible window
  const relativePos = (milestone.chapter_number - startChapter + 0.5) / chapterWidth;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, zIndex: 50 }}
      onClick={() => onClick(milestone)}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 cursor-pointer group",
        isSelected && "z-40"
      )}
      style={{ left: `${relativePos * 100}%`, transform: "translate(-50%, -50%)" }}
    >
      {/* Node */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center ring-4 transition-all shadow-lg",
        cfg.bg, cfg.ring,
        milestone.completed ? "opacity-100" : "opacity-70",
        isSelected ? "ring-8 scale-125" : "hover:ring-8"
      )}>
        {milestone.completed
          ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          : <Circle className="w-3 h-3 text-white" />}
      </div>

      {/* Advisor badge */}
      {milestone.advisor_notes?.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-slate-900">
          {milestone.advisor_notes.length}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-44 bg-slate-800 border border-white/15 rounded-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.bg)} />
          <p className="text-xs font-semibold text-white truncate">{milestone.title}</p>
        </div>
        <p className="text-[10px] text-white/50 mb-1">Ch. {milestone.chapter_number} · {cfg.label}</p>
        {milestone.emotional_state && <p className="text-[10px] text-amber-400/70 italic">"{milestone.emotional_state}"</p>}
        {milestone.advisor_notes?.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400">{milestone.advisor_notes.length} advisor note{milestone.advisor_notes.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}