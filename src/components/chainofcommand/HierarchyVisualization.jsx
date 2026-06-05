import React, { useState, useMemo } from "react";
import AgentCard from "./AgentCard";
import AgentProfile from "./AgentProfile";
import { motion } from "framer-motion";

const CEO = {
  name: "Miranda",
  title: "CHIEF EXECUTIVE OFFICER",
  role: "Human · CEO",
  description: "Supreme human authority over the platform — all AI agents, Advisory Board members, and operations ultimately report upward to this role.",
  emoji: "👑"
};

export default function HierarchyVisualization({
  hierarchy,
  selectedAgent,
  onSelectAgent,
  brandColors,
  deploymentMode,
  pillars,
  onAgentUpdate
}) {
  const [activeTag, setActiveTag] = useState(null);

  // Collect all unique expertise tags across advisory board members
  const allAdvisoryTags = useMemo(() => {
    if (!hierarchy.level7) return [];
    const tags = new Set();
    hierarchy.level7.agents.forEach(a => a.expertise_tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [hierarchy.level7]);

  const filteredAdvisors = useMemo(() => {
    if (!hierarchy.level7) return [];
    if (!activeTag) return hierarchy.level7.agents;
    return hierarchy.level7.agents.filter(a => a.expertise_tags?.includes(activeTag));
  }, [hierarchy.level7, activeTag]);

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

      {/* ══════════════════════════════════════════════
           TIER 0 — CEO (Human, supreme authority)
          ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* CEO label bar */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase whitespace-nowrap"
            style={{ backgroundColor: "#fbbf2420", color: "#fbbf24", border: "1px solid #fbbf2450" }}>
            👑 HUMAN LEADERSHIP — CEO
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#fbbf2430" }} />
          <span className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: "#fbbf2415", color: "#fbbf24" }}>
            Human · Not AI
          </span>
        </div>

        {/* CEO Card */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl border-2 max-w-sm w-full text-center"
            style={{
              background: "linear-gradient(135deg, #1c1407 0%, #2d1f05 100%)",
              borderColor: "#fbbf24",
              boxShadow: "0 0 48px #fbbf2430, 0 0 12px #fbbf2415"
            }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2"
              style={{ borderColor: "#fbbf24", backgroundColor: "#78350f" }}>
              👑
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-1" style={{ color: "#fbbf24" }}>
                CHIEF EXECUTIVE OFFICER
              </p>
              <p className="font-black text-2xl text-white">{CEO.name}</p>
              <p className="text-sm mt-1" style={{ color: "#fbbf2480" }}>Supreme Human Authority</p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">{CEO.description}</p>
          </div>
        </div>

        {/* Connector to Advisory Board */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-8" style={{ backgroundColor: "#fbbf2460" }} />
          <div className="flex items-center gap-3">
            <div className="h-px w-24" style={{ backgroundColor: "#fbbf2430" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#fbbf2450" }}>reports to CEO</span>
            <div className="h-px w-24" style={{ backgroundColor: "#fbbf2430" }} />
          </div>
          <div className="w-0.5 h-8" style={{ backgroundColor: "#fbbf2460" }} />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
           TIER 1 — ADVISORY BOARD (Human experts, not AI)
          ══════════════════════════════════════════════ */}
      {hierarchy.level7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase whitespace-nowrap"
              style={{ backgroundColor: "#0e4a2630", color: "#34d399", border: "1px solid #34d39940" }}>
              🎓 ADVISORY BOARD
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: "#34d39930" }} />
            <span className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: "#34d39915", color: "#34d399" }}>
              Expert Advisors · Not AI
            </span>
          </div>

          {/* Tag Filter Bar */}
          {allAdvisoryTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#34d39980" }}>
                Filter by Expertise
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold border transition-all"
                  style={{
                    backgroundColor: !activeTag ? "#34d39930" : "transparent",
                    borderColor: !activeTag ? "#34d399" : "#34d39940",
                    color: !activeTag ? "#34d399" : "#34d39970"
                  }}
                >
                  All
                </button>
                {allAdvisoryTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold border transition-all"
                    style={{
                      backgroundColor: activeTag === tag ? "#34d39930" : "transparent",
                      borderColor: activeTag === tag ? "#34d399" : "#34d39940",
                      color: activeTag === tag ? "#34d399" : "#34d39970"
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredAdvisors.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: "#34d39960" }}>
              No advisors match this expertise tag.
            </p>
          )}

          <div className={`grid gap-6 ${
            filteredAdvisors.length <= 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {filteredAdvisors.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onSelectAgent(agent)}
                className="cursor-pointer flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border text-center hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #052e1620 0%, #064e3b30 100%)",
                  borderColor: "#34d39950",
                  boxShadow: "0 0 16px #34d39910"
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl border"
                  style={{ borderColor: "#34d39980", backgroundColor: "#064e3b" }}>
                  🎓
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold tracking-wider uppercase" style={{ color: "#34d399" }}>
                    {agent.title}
                  </p>
                  <p className="font-bold text-white mt-1">{agent.name}</p>
                  {agent.expertise_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 justify-center">
                      {agent.expertise_tags.map(tag => (
                        <span
                          key={tag}
                          onClick={e => { e.stopPropagation(); setActiveTag(activeTag === tag ? null : tag); }}
                          className="text-xs px-2 py-0.5 rounded-full cursor-pointer transition-all"
                          style={{
                            backgroundColor: activeTag === tag ? "#34d39940" : "#34d39915",
                            color: activeTag === tag ? "#34d399" : "#34d39980",
                            border: `1px solid ${activeTag === tag ? "#34d39970" : "#34d39930"}`
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider to AI agents */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: brandColors.accent + "40" }} />
            <span className="text-xs font-bold tracking-widest uppercase px-4" style={{ color: brandColors.accent + "60" }}>
              ⬇ AI AGENT HIERARCHY
            </span>
            <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: brandColors.accent + "40" }} />
          </div>
          <div className="w-0.5 h-10 mx-auto" style={{ backgroundColor: brandColors.accent + "80" }} />
        </motion.div>
      )}

      {Object.entries(hierarchy).filter(([k]) => k !== "level7").map((entry, index) => {
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