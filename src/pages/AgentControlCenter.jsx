import React from "react";
import ControlPanel from "@/components/agentcontrol/ControlPanel";
import ObservabilityStats from "@/components/agentcontrol/ObservabilityStats";
import AgentScorecard from "@/components/agentcontrol/AgentScorecard";

export default function AgentControlCenter() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Control Center</h1>
        <p className="text-white/50 text-sm mt-1">One place to evaluate, observe, and control every autonomous agent action.</p>
      </div>
      <ControlPanel />
      <ObservabilityStats />
      <AgentScorecard />
    </div>
  );
}