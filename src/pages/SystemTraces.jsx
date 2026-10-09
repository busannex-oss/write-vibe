import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Activity, X } from "lucide-react";
import TraceRow from "@/components/traces/TraceRow";

const KINDS = ["all", "function_call", "agent_action", "error", "rate_limited"];

export default function SystemTraces() {
  const [kind, setKind] = useState("all");
  const [traceId, setTraceId] = useState(null);
  const [limit, setLimit] = useState(50);

  const query = { ...(kind !== "all" && { kind }), ...(traceId && { trace_id: traceId }) };
  const { data, isLoading } = useQuery({
    queryKey: ["traces", kind, traceId, limit],
    queryFn: () => base44.entities.SystemTrace.filter(query, { sort: "-created_date", limit }),
    refetchInterval: 15000,
  });
  const items = data?.items || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">System Traces</h1>
          <p className="text-sm text-white/50">Function calls, agent actions, errors and rate limits in one timeline.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {KINDS.map((k) => (
          <Button key={k} size="sm" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
            {k.replace("_", " ")}
          </Button>
        ))}
        {traceId && (
          <Button size="sm" variant="secondary" onClick={() => setTraceId(null)}>
            Trace {traceId.slice(0, 8)} <X />
          </Button>
        )}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-white/40">
            <tr>{["Time", "Kind", "Source", "Status", "User", "Trace", "Message"].map((h) => <th key={h} className="py-2 px-3">{h}</th>)}</tr>
          </thead>
          <tbody>{items.map((t) => <TraceRow key={t.id} t={t} onTrace={setTraceId} />)}</tbody>
        </table>
        {isLoading && <p className="p-6 text-center text-white/40">Loading…</p>}
        {!isLoading && !items.length && <p className="p-6 text-center text-white/40">No events yet.</p>}
      </div>
      {data?.has_more && (
        <div className="mt-4 text-center"><Button variant="outline" onClick={() => setLimit(limit + 50)}>Load more</Button></div>
      )}
    </div>
  );
}