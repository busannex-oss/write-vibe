import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, BookOpen, ClipboardList, Bot } from "lucide-react";
import { format } from "date-fns";
import AgentNameLink from "@/components/agents/AgentNameLink";

const ICONS = { decision: AlertTriangle, book: BookOpen, sop: ClipboardList, agent: Bot };

export default function PEATimelineItem({ item, onResolve, isLast }) {
  const urgent = item.kind === "decision" && !item.resolved;
  const Icon = item.resolved ? CheckCircle2 : (ICONS[item.kind] || Bot);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border",
          urgent ? "bg-red-500/20 border-red-400/60 text-red-300 animate-pulse"
            : item.resolved ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
            : "bg-white/5 border-white/15 text-white/50"
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
      </div>
      <div className={cn("flex-1 pb-4 min-w-0", urgent && "rounded-lg -mt-1 p-3 bg-red-500/10 border border-red-500/30")}>
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-tight", urgent ? "text-red-200" : "text-white/85")}>{item.title}</p>
          <span className="text-[10px] text-white/35 whitespace-nowrap">{format(new Date(item.date), "MMM d, yyyy · h:mm a")}</span>
        </div>
        {item.subtitle && <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.subtitle}</p>}
        {item.actor && (
          <p className="text-[11px] text-white/30 mt-1">
            by <AgentNameLink name={item.actor} className="text-[11px]" />
          </p>
        )}
        {urgent && (
          <div className="flex gap-3 mt-2">
            {item.linkPage && (
              <Link to={createPageUrl(item.linkPage)} className="text-xs text-amber-300 hover:text-amber-200 underline underline-offset-2">Review</Link>
            )}
            <button onClick={() => onResolve(item.id)} className="text-xs text-white/50 hover:text-white">Mark handled</button>
          </div>
        )}
      </div>
    </div>
  );
}