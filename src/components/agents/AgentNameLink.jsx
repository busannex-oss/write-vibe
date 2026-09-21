import React, { useState } from "react";
import { findAgent } from "@/lib/agentDirectory";
import AgentProfileDialog from "./AgentProfileDialog";
import { Bot } from "lucide-react";

/**
 * Renders an actor's name. If the name belongs to a known AI agent it becomes a
 * clickable link that opens the agent's profile (including its unique ID).
 * Human actors render as plain text.
 */
export default function AgentNameLink({ name, className = "" }) {
  const [open, setOpen] = useState(false);
  const agent = findAgent(name);

  if (!agent) {
    return <span className={`font-medium text-white ${className}`}>{name || "Someone"}</span>;
  }

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        title={`${agent.role} · ${agent.agent_id}`}
        className={`inline-flex items-center gap-1 font-medium text-amber-300 hover:text-amber-200 underline decoration-dotted underline-offset-2 ${className}`}
      >
        <Bot className="w-3 h-3" />
        {agent.name}
      </button>
      <AgentProfileDialog agent={agent} open={open} onOpenChange={setOpen} />
    </>
  );
}