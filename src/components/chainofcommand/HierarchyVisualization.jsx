import React, { useState } from "react";
import AgentCard from "./AgentCard";
import AgentProfile from "./AgentProfile";
import { motion } from "framer-motion";

const HUMAN_LEADERSHIP = [
  {
    name: "Slade Kevin Morrison",
    title: "ADVISORY BOARD MEMBER",
    role: "Advisory Board Member",
    description: "Visionary platform leader advising on long-term strategic direction, culture-building, and ensuring every decision serves the platform's deepest mission.",
    emoji: "👤"
  }
];

export default function HierarchyVisualization({
  hierarchy,
  selectedAgent,
  onSelectAgent,
  brandColors,
  deploymentMode,
  pillars,
  onAgentUpdate
}) {
  const levelLabels = {
    level1: "SYSTEM OWNER",
    level2: "EXECUTIVE AGENTS",
    level3: "CREATIVE PRODUCTION",
    level4: "MARKETING & GROWTH",
    level5: "MEDIA PRODUCTION",
    level6: "SYSTEM MAINTENANCE & COMPLIANCE"
  };

  return (
    <div className="space-y-16 pb-16">

      {/* ── HUMAN LEADERSHIP ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Section header */}
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase whitespace-nowrap"
            style={{
              backgroundColor: "#7c3aed30",
              color: "#a78bfa",
              border: "1px solid #7c3aed60"
            }}
          >
            👤 HUMAN LEADERSHIP
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#7c3aed40" }} />
          <span className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: "#7c3aed20", color: "#a78bfa" }}>
            Human · Not AI
          </span>
        </div>

        {/* Leadership cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {HUMAN_LEADERSHIP.map((person) => (
            <div
              key={person.name}
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 max-w-xs w-full text-center"
              style={{
                backgroundColor: "#1e1b4b80",
                borderColor: "#7c3aed",
                boxShadow: "0 0 32px #7c3aed25"
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
                style={{ borderColor: "#a78bfa", backgroundColor: "#2e1065" }}
              >
                {person.emoji}
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#a78bfa" }}>
                  {person.title}
                </p>
                <p className="font-bold text-lg text-white">{person.name}</p>
                <p className="text-sm mt-1 text-white/60">{person.role}</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{person.description}</p>
            </div>
          ))}
        </div>

        {/* Divider separating human from AI */}
        <div className="flex items-center gap-4 pt-4">
          <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: "#7c3aed40" }} />
          <span className="text-xs font-bold tracking-widest uppercase px-4" style={{ color: "#a78bfa60" }}>
            AI AGENT HIERARCHY BELOW
          </span>
          <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: "#7c3aed40" }} />
        </div>
        <div className="w-0.5 h-12 mx-auto" style={{ backgroundColor: brandColors.accent }} />
      </motion.div>

      {Object.entries(hierarchy).map((entry, index) => {
        const [levelKey, levelData] = entry;
        const levelLabel = levelLabels[levelKey];

        return (
          <motion.div
            key={levelKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-6"
          >
            {/* Level Label */}
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: brandColors.secondary + "80",
                  color: brandColors.accent,
                  borderColor: brandColors.accent + "40",
                  border: `1px solid ${brandColors.accent}40`
                }}
              >
                {levelLabel}
              </div>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: brandColors.accent + "40" }}
              />
            </div>

            {/* Hierarchy Line */}
            {index < Object.keys(hierarchy).length - 1 && (
              <div
                className="w-0.5 h-12 mx-auto"
                style={{ backgroundColor: brandColors.accent }}
              />
            )}

            {/* Agent Cards */}
            <div
              className={`grid gap-8 ${
                levelData.agents.length <= 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : levelData.agents.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              } justify-center`}
            >
              {levelData.agents.map((agent, agentIndex) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + agentIndex * 0.05 }}
                  onClick={() => onSelectAgent(agent)}
                >
                  <AgentCard
                    agent={agent}
                    brandColors={brandColors}
                    isSelected={selectedAgent?.id === agent.id}
                    pillars={pillars}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Agent Profile Modal */}
      {selectedAgent && (
        <AgentProfile
          agent={selectedAgent}
          onClose={() => onSelectAgent(null)}
          brandColors={brandColors}
          pillars={pillars}
          onAgentUpdate={onAgentUpdate}
        />
      )}
    </div>
  );
}