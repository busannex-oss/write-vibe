import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight } from "lucide-react";

const fmt = (d) => (d ? new Date(d).toLocaleString() : "");

export default function DecisionAuditEntry({ task, minutes }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{task.title}</p>
          <p className="text-[11px] text-white/40">{task.agent_name} · {fmt(task.updated_date)}</p>
        </div>
        <span className="text-[11px] font-bold uppercase text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">{task.consensus || "pending"}</span>
        <span className="text-[11px] text-white/50">{task.status}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Original task</p>
            <p className="text-white/80 whitespace-pre-wrap">{task.instructions || task.title}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Votes</p>
            {task.reviews.map((r, i) => (
              <div key={i} className="border-l-2 border-white/10 pl-3 mb-2">
                <p className="text-white"><b>{r.reviewer}</b> — <span className="uppercase text-amber-300 text-xs">{r.decision}</span> <span className="text-white/30 text-xs">{fmt(r.at)}</span></p>
                {r.rationale && <p className="text-white/60">{r.rationale}</p>}
                {r.recommendation && <p className="text-white/50 italic">Recommends: {r.recommendation}</p>}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Resulting document / change</p>
            {minutes?.minutes_html ? (
              <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: minutes.minutes_html }} />
            ) : task.output ? (
              <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{task.output}</ReactMarkdown></div>
            ) : (
              <p className="text-white/40">No final document yet{task.consensus === "split" ? " — reviewers split, awaiting your decision." : "."}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}