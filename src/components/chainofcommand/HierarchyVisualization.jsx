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