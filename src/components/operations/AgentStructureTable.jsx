import React, { useState } from "react";
import { AGENT_DIRECTORY } from "@/lib/agentDirectory";
import { Input } from "@/components/ui/input";

const SORTS = { department: "Department", governance_level: "Governance", team: "Team", name: "Name" };

export default function AgentStructureTable({ showFounderAgents }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("department");
  const rows = AGENT_DIRECTORY
    .filter((a) => a.key !== "personal_executive_assistant" || showFounderAgents)
    .filter((a) => [a.name, a.department, a.team, a.role].join(" ").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => String(a[sort] || "").localeCompare(String(b[sort] || "")) || a.name.localeCompare(b.name));

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white">Team Structure</h2>
      <p className="text-white/40 text-sm mt-1 mb-4">Each agent's department, governance level, and team assignment.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, departments, teams…" className="h-9 max-w-xs" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-md px-2 text-sm">
          {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>Sort by {l}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
            <tr><th className="p-3">Agent</th><th className="p-3">Department</th><th className="p-3">Governance</th><th className="p-3">Team</th></tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.key} className="border-t border-white/5">
                <td className="p-3"><p className="text-white font-medium">{a.name}</p><p className="text-[11px] text-white/40">{a.role}</p></td>
                <td className="p-3 text-white/70">{a.department}</td>
                <td className="p-3"><span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded mr-2">{a.governance_level}</span><span className="text-white/50 text-xs">{a.governance_label}</span></td>
                <td className="p-3 text-white/70">{a.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}