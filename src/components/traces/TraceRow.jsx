import React from "react";
import { format } from "date-fns";

const KIND_STYLES = {
  function_call: "bg-sky-500/15 text-sky-300",
  agent_action: "bg-violet-500/15 text-violet-300",
  error: "bg-red-500/15 text-red-300",
  rate_limited: "bg-amber-500/15 text-amber-300",
};

export default function TraceRow({ t, onTrace }) {
  return (
    <tr className="border-t border-white/5 text-sm">
      <td className="py-2 px-3 text-white/50 whitespace-nowrap">{format(new Date(t.created_date), "MMM d, HH:mm:ss")}</td>
      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${KIND_STYLES[t.kind]}`}>{t.kind.replace("_", " ")}</span></td>
      <td className="py-2 px-3 text-white/80">{t.source}</td>
      <td className="py-2 px-3 text-white/60">{t.status}{t.duration_ms ? ` · ${t.duration_ms}ms` : ""}</td>
      <td className="py-2 px-3 text-white/50 truncate max-w-[180px]">{t.user_email || "system"}</td>
      <td className="py-2 px-3">
        {t.trace_id && (
          <button onClick={() => onTrace(t.trace_id)} className="text-amber-400 hover:underline font-mono text-xs">{t.trace_id.slice(0, 8)}</button>
        )}
      </td>
      <td className="py-2 px-3 text-white/50 truncate max-w-[240px]" title={t.message}>{t.message}</td>
    </tr>
  );
}