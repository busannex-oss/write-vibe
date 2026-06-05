import React, { useState } from "react";
import AgentCard from "./AgentCard";
import AgentProfile from "./AgentProfile";
import { motion } from "framer-motion";

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

      {/* Human CEO / Administrator — top of chain, not an AI agent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase"
            style={{
              backgroundColor: brandColors.secondary + "80",
              color: brandColors.accent,
              border: `1px solid ${brandColors.accent}40`
            }}
          >
            SYSTEM OWNER
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: brandColors.accent + "40" }} />
        </div>

        <div className="flex justify-center">
          <div
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 max-w-xs w-full text-center"
            style={{
              backgroundColor: brandColors.secondary + "60",
              borderColor: brandColors.accent,
              boxShadow: `0 0 24px ${brandColors.accent}30`
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2"
              style={{ borderColor: brandColors.accent, backgroundColor: brandColors.secondary, color: brandColors.accent }}
            >
              👤
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: brandColors.accent }}>
                HUMAN · CEO / ADMINISTRATOR
              </p>
              <p className="font-bold text-lg" style={{ color: brandColors.text }}>Slade Kevin Morrison</p>
              <p className="text-sm mt-1" style={{ color: brandColors.text + "80" }}>Founder & Platform Owner</p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider"
              style={{ backgroundColor: brandColors.accent + "20", color: brandColors.accent }}
            >
              Human — Not AI
            </span>
          </div>
        </div>

        {/* Connector line down to agents */}
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