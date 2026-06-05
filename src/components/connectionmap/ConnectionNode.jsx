import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crown, Bot, Users, Shield, Sparkles, Star, Briefcase } from "lucide-react";

const ROLE_CONFIG = {
  admin:       { icon: Crown,    bg: "bg-amber-500",   ring: "ring-amber-500/40",   label: "Owner" },
  executive:   { icon: Briefcase,bg: "bg-blue-500",    ring: "ring-blue-500/40",    label: "Executive" },
  manager:     { icon: Bot,      bg: "bg-emerald-500", ring: "ring-emerald-500/40", label: "Agent" },
  specialist:  { icon: Sparkles, bg: "bg-purple-500",  ring: "ring-purple-500/40",  label: "Specialist" },
  advisor:     { icon: Star,     bg: "bg-indigo-500",  ring: "ring-indigo-500/40",  label: "Advisor" },
  maintenance: { icon: Shield,   bg: "bg-slate-500",   ring: "ring-slate-500/40",   label: "Compliance" },
};

export default function ConnectionNode({ agent, x, y, isSelected, onClick, scale = 1, showLabel = true }) {
  const cfg = ROLE_CONFIG[agent.role] || ROLE_CONFIG.manager;
  const Icon = cfg.icon;
  const size = agent.role === "advisor" ? 52 : agent.role === "executive" ? 48 : agent.role === "admin" ? 56 : 40;

  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.12 }}
      style={{ cursor: "pointer" }}
      onClick={() => onClick(agent)}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle r={size / 2 + 8} fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth={2} strokeDasharray="4 2" />
      )}

      {/* Avatar circle */}
      {agent.image ? (
        <>
          <defs>
            <clipPath id={`clip-${agent.id}`}>
              <circle r={size / 2} />
            </clipPath>
          </defs>
          <image
            href={agent.image}
            x={-size / 2} y={-size / 2}
            width={size} height={size}
            clipPath={`url(#clip-${agent.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
          <circle r={size / 2} fill="none" stroke={cfg.bg.replace("bg-", "").includes("amber") ? "#f59e0b" : "#fff"} strokeWidth={2} opacity={0.4} />
        </>
      ) : (
        <circle r={size / 2} className={cfg.bg}
          fill={cfg.bg.includes("amber") ? "#f59e0b" : cfg.bg.includes("blue") ? "#3b82f6" : cfg.bg.includes("emerald") ? "#10b981" : cfg.bg.includes("purple") ? "#a855f7" : cfg.bg.includes("indigo") ? "#6366f1" : "#64748b"}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1.5}
        />
      )}

      {/* Role icon (when no image) */}
      {!agent.image && (
        <foreignObject x={-12} y={-12} width={24} height={24} style={{ pointerEvents: "none" }}>
          <div className="w-6 h-6 flex items-center justify-center">
            <Icon size={14} color="white" />
          </div>
        </foreignObject>
      )}

      {/* Status dot */}
      <circle cx={size / 2 - 4} cy={-size / 2 + 4} r={5}
        fill={agent.status === "active" ? "#10b981" : "#ef4444"}
        stroke="#0f172a" strokeWidth={1.5}
      />

      {/* Label */}
      {showLabel && (
        <>
          <text y={size / 2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={10} fontWeight="600" fontFamily="inherit">
            {agent.name.split(" ").slice(0, 2).join(" ")}
          </text>
          <text y={size / 2 + 26} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="inherit">
            {agent.title.split(" ").slice(0, 3).join(" ")}
          </text>
        </>
      )}
    </motion.g>
  );
}