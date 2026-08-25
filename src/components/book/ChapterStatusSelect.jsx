import React from "react";
import { PenLine, Eye, CheckCircle2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CHAPTER_STATUSES = [
  { id: "drafting",  label: "Drafting",  icon: PenLine,      classes: "bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20" },
  { id: "reviewing", label: "Reviewing", icon: Eye,          classes: "bg-sky-500/10 text-sky-400 border-sky-500/25 hover:bg-sky-500/20" },
  { id: "finalized", label: "Finalized", icon: CheckCircle2, classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20" },
];

export default function ChapterStatusSelect({ status = "drafting", onChange }) {
  const current = CHAPTER_STATUSES.find((s) => s.id === status) || CHAPTER_STATUSES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors shrink-0",
            current.classes
          )}
        >
          <current.icon className="w-3 h-3" />
          {current.label}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-white/10" onClick={(e) => e.stopPropagation()}>
        {CHAPTER_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={(e) => { e.stopPropagation(); onChange(s.id); }}
            className={cn("gap-2 text-sm cursor-pointer focus:bg-white/10", s.id === status ? "text-white" : "text-white/60")}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}