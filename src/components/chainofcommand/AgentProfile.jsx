import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLE_DESCRIPTIONS = {
  admin: "System Owner — oversees the entire organizational intelligence network and ensures all agents operate within established protocols.",
  executive: "Executive Director — manages strategic operations and coordinates multi-department initiatives aligned with business objectives.",
  manager: "Department Manager — supervises specialized teams, monitors performance, and reports directly to executive level.",
  maintenance: "System Maintenance & Memory Guardian — manages persistent agent memory, knowledge bases, and cross-agent communication systems.",
  specialist: "Specialized Intelligence Node — operates as a subject matter expert providing targeted intelligence and analysis in their domain."
};

export default function AgentProfile({ agent, onClose, brandColors, pillars }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "#10b981", label: "ACTIVE" },
      in_development: { color: "#f59e0b", label: "IN DEVELOPMENT" },
      planned: { color: "#6366f1", label: "PLANNED" }
    };
    return statusConfig[status] || statusConfig.active;
  };

  const statusBadge = getStatusBadge(agent.status);

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 h-full w-full md:w-96 z-50 overflow-y-auto"
        style={{ backgroundColor: brandColors.background }}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 border-b flex items-center justify-between"
          style={{
            backgroundColor: brandColors.secondary + "80",
            borderColor: brandColors.accent + "40"
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: brandColors.text }}>
            Agent Profile
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div
            className="px-4 py-3 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: statusBadge.color + "20",
              borderColor: statusBadge.color + "40",
              border: `1px solid ${statusBadge.color}40`
            }}
          >
            <CheckCircle className="w-4 h-4" style={{ color: statusBadge.color }} />
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: statusBadge.color }}
            >
              {statusBadge.label}
            </span>
          </div>

          {/* Name & Title */}
          <div>
            <h3
              className="text-3xl font-bold mb-1"
              style={{ color: brandColors.text }}
            >
              {agent.name}
            </h3>
            <p
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: brandColors.accent }}
            >
              {agent.title}
            </p>
          </div>

          {/* Role Description */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-2"
              style={{ color: brandColors.accent }}
            >
              Role Description
            </h4>
            <p style={{ color: brandColors.text + "CC" }}>
              {ROLE_DESCRIPTIONS[agent.role]}
            </p>
          </div>

          {/* Pillar Alignment */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-3"
              style={{ color: brandColors.accent }}
            >
              Pillar Alignment
            </h4>
            <div className="space-y-2">
              {agent.pillars?.map((pillar, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: brandColors.accent + "15",
                    borderColor: brandColors.accent + "40",
                    border: `1px solid ${brandColors.accent}40`
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: brandColors.accent }}
                  >
                    {pillar}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: brandColors.text + "88" }}
                  >
                    Strategic alignment with core organizational pillars
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Capabilities */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-3"
              style={{ color: brandColors.accent }}
            >
              Core Capabilities
            </h4>
            <ul
              className="space-y-2"
              style={{ color: brandColors.text + "CC" }}
            >
              <li>✓ Persistent memory and context awareness</li>
              <li>✓ Cross-agent communication and coordination</li>
              <li>✓ Real-time performance monitoring</li>
              <li>✓ Autonomous task execution and escalation</li>
            </ul>
          </div>

          {/* Communication Channels */}
          <div>
            <h4
              className="text-sm font-bold uppercase mb-3"
              style={{ color: brandColors.accent }}
            >
              Communication Channels
            </h4>
            <div
              className="space-y-2"
              style={{ color: brandColors.text + "CC" }}
            >
              <p>Direct briefing: Reports to executive level</p>
              <p>Knowledge base: Shared organizational intelligence</p>
              <p>Alert system: Critical threshold notifications</p>
            </div>
          </div>

          {/* Memory System */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: brandColors.secondary + "60",
              borderColor: brandColors.accent + "40",
              border: `1px solid ${brandColors.accent}40`
            }}
          >
            <h4
              className="text-sm font-bold uppercase mb-2"
              style={{ color: brandColors.accent }}
            >
              Memory & Knowledge Base
            </h4>
            <p style={{ color: brandColors.text + "CC", fontSize: "0.875rem" }}>
              Persistent memory enabled. Knowledge base: synchronized with organizational documents. Last update: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Performance Metrics */}
          {agent.status === "active" && (
            <div>
              <h4
                className="text-sm font-bold uppercase mb-3"
                style={{ color: brandColors.accent }}
              >
                Performance Metrics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: brandColors.text + "88" }}>Task Completion</span>
                  <span style={{ color: "#10b981" }}>96%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: brandColors.text + "88" }}>Response Time</span>
                  <span style={{ color: "#10b981" }}>1.2s avg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: brandColors.text + "88" }}>System Health</span>
                  <span style={{ color: "#10b981" }}>98%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}