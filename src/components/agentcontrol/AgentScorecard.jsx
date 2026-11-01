import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Evaluation: completion, failure and human-intervention rates per agent.
export default function AgentScorecard() {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-scorecard"],
    queryFn: () => base44.entities.AgentTask.aggregate({ groupBy: ["agent_name", "status"] }),
  });
  const byAgent = {};
  (data?.rows || []).forEach((r) => {
    const a = (byAgent[r.agent_name || "Unassigned"] ||= { total: 0 });
    a.total += r.count;
    a[r.status] = (a[r.status] || 0) + r.count;
  });
  const pct = (n, d) => (d ? Math.round(((n || 0) / d) * 100) : 0);

  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader><CardTitle className="text-white text-base">Evaluation — agent scorecard</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? <p className="text-white/40 text-sm">Loading…</p> : (
          <table className="w-full text-sm">
            <thead className="text-white/40 text-xs uppercase">
              <tr><th className="text-left py-2">Agent</th><th>Tasks</th><th>Success</th><th>Failure</th><th>Human stops</th><th>Awaiting approval</th></tr>
            </thead>
            <tbody className="text-white/80">
              {Object.entries(byAgent).sort((a, b) => b[1].total - a[1].total).map(([name, a]) => {
                const fail = pct(a.failed, a.total);
                return (
                  <tr key={name} className="border-t border-white/5 text-center">
                    <td className="text-left py-2">{name}</td>
                    <td>{a.total}</td>
                    <td className="text-emerald-400">{pct(a.completed, a.total)}%</td>
                    <td className={fail > 20 ? "text-red-400 font-semibold" : "text-white/60"}>{fail}%</td>
                    <td>{pct((a.stopped || 0) + (a.skipped || 0), a.total)}%</td>
                    <td>{a.awaiting_approval || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}