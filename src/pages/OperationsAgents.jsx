import React, { useState } from "react";
import { Workflow, Gauge, Bot, Lightbulb, HeartHandshake, ShieldCheck } from "lucide-react";
import AgentChatPanel from "@/components/agents/AgentChatPanel";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    name: "workflow_architect",
    label: "Workflow Architect",
    icon: Workflow,
    blurb: "Maps and redesigns end-to-end workflows across the production pipeline — stages, owners, hand-offs, and decision gates.",
    placeholder: "e.g. Map our manuscript-to-published workflow and show me where ownership is unclear..."
  },
  {
    name: "process_optimization",
    label: "Process Optimization",
    icon: Gauge,
    blurb: "Finds friction, waste, and bottlenecks in existing processes and ranks improvements by impact vs. effort.",
    placeholder: "e.g. Where are books getting stuck, and what's the highest-impact fix?"
  },
  {
    name: "automation_architect",
    label: "Automation Architect",
    icon: Bot,
    blurb: "Decides what should be automated, what stays manual, and specifies each automation as a build-ready blueprint.",
    placeholder: "e.g. Which parts of our distribution process should be automated?"
  },
  {
    name: "innovation_agent",
    label: "Innovation Agent",
    icon: Lightbulb,
    blurb: "Generates and pressure-tests new features, product lines, and revenue streams grounded in market reality.",
    placeholder: "e.g. What new revenue streams could we add for existing authors?"
  },
  {
    name: "retention_agent",
    label: "Retention Agent",
    icon: HeartHandshake,
    blurb: "Tracks author engagement and churn risk, and designs interventions that restore writing momentum.",
    placeholder: "e.g. Which authors are at risk of churning, and what should we do about it?"
  },
  {
    name: "human_in_the_loop",
    label: "Human-in-the-Loop",
    icon: ShieldCheck,
    blurb: "Governance gatekeeper — classifies action risk and prepares clear approval briefs before anything irreversible happens.",
    placeholder: "e.g. Review this proposed action and tell me if it needs my approval..."
  }
];

export default function OperationsAgents() {
  const [active, setActive] = useState(AGENTS[0]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Operations Agents</h1>
        <p className="text-white/40 text-sm mt-1">
          Your operating team — workflow design, process improvement, automation strategy, innovation, retention, and human oversight.
        </p>
      </div>

      {/* Agent selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {AGENTS.map((a) => {
          const isActive = a.name === active.name;
          return (
            <button
              key={a.name}
              onClick={() => setActive(a)}
              className={cn(
                "text-left p-3 rounded-xl border transition-all",
                isActive
                  ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/40"
                  : "bg-slate-900 border-white/10 hover:border-white/25"
              )}
            >
              <a.icon className={cn("w-4 h-4 mb-1.5", isActive ? "text-amber-400" : "text-white/40")} />
              <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-amber-300" : "text-white/80")}>
                {a.label}
              </p>
            </button>
          );
        })}
      </div>

      <AgentChatPanel agent={active} />
    </div>
  );
}