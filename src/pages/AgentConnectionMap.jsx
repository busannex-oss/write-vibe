import React, { useState, useRef, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Filter, Download,
  Loader2, Network, Star, Users, Bot, Crown, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConnectionNode from "@/components/connectionmap/ConnectionNode";
import AgentDetailCard from "@/components/connectionmap/AgentDetailCard";

// Full agent data from ChainOfCommand — imported inline for the map
const ALL_AGENTS = [
  { id: "admin", name: "Administrator", title: "SYSTEM OWNER", role: "admin", status: "active", pillars: ["Proper Business Structure"], description: "Core system governance and oversight", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { id: "brand_guardian", name: "Marcus Whitmore", title: "BRAND GUARDIAN", role: "executive", status: "active", pillars: ["Proper Business Structure", "Strategic Application"], description: "Enforces brand compliance and consistency", mission: "Be the unwavering conscience of every creative decision." },
  { id: "automation_orchestrator", name: "Sam Johnson", title: "AUTOMATION ORCHESTRATOR", role: "executive", status: "active", pillars: ["Business Intelligence", "Proper Business Structure"], description: "Manages workflow automation and SLA enforcement" },
  { id: "project_manager", name: "Sam Thompson", title: "PROJECT MANAGER", role: "executive", status: "active", pillars: ["Proper Business Structure", "Business Intelligence"], description: "Oversees all book projects from conception to publication", mission: "Shepherd every book from raw idea to polished reality." },
  { id: "character_creator", name: "James Mitchell", title: "CHARACTER CREATOR", role: "manager", status: "active", pillars: ["Progressive Development"], description: "Crafts vivid, psychologically complex characters" },
  { id: "outline_generator", name: "Olivia Rodriguez", title: "OUTLINE GENERATOR", role: "manager", status: "active", pillars: ["Strategic Application", "Business Intelligence"], description: "Creates comprehensive, emotionally resonant story outlines" },
  { id: "cover_designer", name: "Derek Thompson", title: "COVER DESIGNER", role: "manager", status: "active", pillars: ["Strategic Application", "Exemplary Customer Service"], description: "Designs visually stunning, strategically positioned book covers" },
  { id: "summary_writer", name: "Rachel Chen", title: "SUMMARY WRITER", role: "manager", status: "active", pillars: ["Exemplary Customer Service", "Wealth Strategies Trajectory"], description: "Crafts compelling book summaries that convert browsers into buyers" },
  { id: "text_formatter", name: "Emma Lewis", title: "TEXT FORMATTER", role: "manager", status: "active", pillars: ["Progressive Development", "Strategic Application"], description: "Transforms raw text into professionally formatted content" },
  { id: "title_suggester", name: "Alexandra Chen", title: "TITLE & SEO STRATEGIST", role: "manager", status: "active", pillars: ["Predictive Analysis", "Business Intelligence"], description: "Generates compelling, market-winning book titles" },
  { id: "marketing_assistant", name: "Priya Patel", title: "MARKETING ASSISTANT", role: "manager", status: "active", pillars: ["Wealth Strategies Trajectory", "Partnership Alignment"], description: "Executes multi-channel marketing campaigns" },
  { id: "bookstore_advisor", name: "Nathan Brooks", title: "BOOKSTORE ADVISOR", role: "manager", status: "active", pillars: ["Partnership Alignment", "Wealth Strategies Trajectory"], description: "Strategically positions books in distribution channels" },
  { id: "brand_strategist", name: "Victoria Lopez", title: "BRAND STRATEGIST", role: "manager", status: "active", pillars: ["Proper Business Structure", "Strategic Application"], description: "Builds and evolves author brands for long-term loyalty" },
  { id: "video_producer", name: "Chloe Martinez", title: "VIDEO PRODUCER", role: "specialist", status: "active", pillars: ["Progressive Development", "Strategic Application"], description: "Creates compelling book video commercials" },
  { id: "audiobook_producer", name: "David Chen", title: "AUDIOBOOK PRODUCER", role: "specialist", status: "active", pillars: ["Progressive Development", "Exemplary Customer Service"], description: "Generates professional-quality audiobook narrations" },
  { id: "media_production", name: "Luis Garcia", title: "MEDIA PRODUCTION AGENT", role: "specialist", status: "active", pillars: ["Business Intelligence", "Proper Business Structure"], description: "Orchestrates all audio and video production pipelines" },
  { id: "ethical_ai_officer", name: "Dr. Samantha Brooks", title: "ETHICAL AI OFFICER", role: "maintenance", status: "active", pillars: ["Proper Business Structure", "Business Intelligence"], description: "Enforces ethical standards and regulatory compliance" },
  { id: "diagnostics_agent", name: "Dr. Aisha Morgan", title: "DIAGNOSTICS AGENT", role: "maintenance", status: "active", pillars: ["Business Intelligence", "Predictive Analysis"], description: "Identifies and resolves application errors with precision" },
  { id: "membership_manager", name: "Angela Kim", title: "MEMBERSHIP MANAGER", role: "maintenance", status: "active", pillars: ["Exemplary Customer Service", "Proper Business Structure"], description: "Manages user memberships and subscription tiers" },
  { id: "advisory_tyler_perry", name: "Tyler Perry", title: "CREATIVE EMPIRE ADVISOR", role: "advisor", status: "active", pillars: ["Proper Business Structure", "Wealth Strategies Trajectory"], description: "Guides on building self-owned creative empires", mission: "Show every author that owning your infrastructure is owning your future.", goals: ["Guide authors on owning publishing infrastructure", "Advise on brand ecosystems beyond the book"] },
  { id: "advisory_thurgood_marshall", name: "Thurgood Marshall", title: "LEGAL STRATEGY ADVISOR", role: "advisor", status: "active", pillars: ["Proper Business Structure", "Business Intelligence"], description: "Advises on IP protection, rights negotiation, and legal strategy", mission: "Ensure every author understands that their words are their rights.", goals: ["Advise on copyright strategy and rights retention", "Identify legal vulnerabilities in publishing agreements"] },
  { id: "advisory_toni_morrison", name: "Toni Morrison", title: "LITERARY EXCELLENCE ADVISOR", role: "advisor", status: "active", pillars: ["Progressive Development", "Exemplary Customer Service"], description: "Elevates literary craft, authentic voice, and cultural resonance", mission: "Remind every author that the most powerful stories are the ones only they can tell.", goals: ["Elevate manuscript prose", "Coach authors on finding and protecting their unique voice"], personality: "Exacting, profound, and quietly fierce." },
  { id: "advisory_shonda_rhimes", name: "Shonda Rhimes", title: "NARRATIVE & IP EXPANSION ADVISOR", role: "advisor", status: "active", pillars: ["Strategic Application", "Wealth Strategies Trajectory"], description: "Advises on expanding book IP into multi-platform franchises", mission: "Help authors see their book not as a product but as a universe.", goals: ["Identify books with high adaptation potential", "Advise on series and universe-building"] },
  { id: "advisory_jk_rowling", name: "J.K. Rowling", title: "WORLD-BUILDING ADVISOR", role: "advisor", status: "active", pillars: ["Progressive Development", "Wealth Strategies Trajectory"], description: "Advises on immersive world-building and franchise architecture", mission: "Show authors that a truly great book opens a door into a world readers refuse to leave.", goals: ["Guide authors in constructing rich fictional worlds", "Help authors build reader communities"] },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", title: "VISIONARY FOUNDER ADVISOR", role: "advisor", status: "active", pillars: ["Proper Business Structure", "Wealth Strategies Trajectory", "Strategic Application"], description: "Advises on visionary platform leadership and transformative publishing ecosystems", mission: "Ensure this platform fulfills its highest potential — not just as a tool, but as a movement.", goals: ["Champion the platform's founding mission", "Advise on scaling without losing author-first soul"], personality: "Visionary, grounded, and deeply mission-driven." },
];

// Connection graph definition (from → to)
const CONNECTIONS = [
  // Admin → executives
  { from: "admin", to: "brand_guardian" }, { from: "admin", to: "automation_orchestrator" }, { from: "admin", to: "project_manager" },
  // Executives → agents
  { from: "project_manager", to: "character_creator" }, { from: "project_manager", to: "outline_generator" },
  { from: "project_manager", to: "cover_designer" }, { from: "project_manager", to: "summary_writer" }, { from: "project_manager", to: "text_formatter" },
  { from: "brand_guardian", to: "brand_strategist" }, { from: "brand_guardian", to: "title_suggester" }, { from: "brand_guardian", to: "cover_designer" },
  { from: "automation_orchestrator", to: "marketing_assistant" }, { from: "automation_orchestrator", to: "bookstore_advisor" }, { from: "automation_orchestrator", to: "media_production" },
  // Media
  { from: "media_production", to: "video_producer" }, { from: "media_production", to: "audiobook_producer" },
  // Maintenance
  { from: "admin", to: "ethical_ai_officer" }, { from: "admin", to: "diagnostics_agent" }, { from: "admin", to: "membership_manager" },
  // Advisors → relevant agents (advisory connections)
  { from: "advisory_toni_morrison", to: "character_creator", type: "advisory" }, { from: "advisory_toni_morrison", to: "summary_writer", type: "advisory" },
  { from: "advisory_jk_rowling", to: "outline_generator", type: "advisory" }, { from: "advisory_jk_rowling", to: "character_creator", type: "advisory" },
  { from: "advisory_shonda_rhimes", to: "outline_generator", type: "advisory" }, { from: "advisory_shonda_rhimes", to: "brand_strategist", type: "advisory" },
  { from: "advisory_tyler_perry", to: "project_manager", type: "advisory" }, { from: "advisory_tyler_perry", to: "bookstore_advisor", type: "advisory" },
  { from: "advisory_thurgood_marshall", to: "admin", type: "advisory" },
  { from: "advisory_slade_kevin_morrison", to: "admin", type: "advisory" }, { from: "advisory_slade_kevin_morrison", to: "project_manager", type: "advisory" },
];

// Layout positions: ring layout per role
function computeLayout(width, height) {
  const cx = width / 2, cy = height / 2;
  const positions = {};
  // Admin center
  positions["admin"] = { x: cx, y: cy };

  // Executives — inner ring
  const execs = ["brand_guardian", "automation_orchestrator", "project_manager"];
  execs.forEach((id, i) => {
    const angle = (i / execs.length) * 2 * Math.PI - Math.PI / 2;
    positions[id] = { x: cx + 130 * Math.cos(angle), y: cy + 100 * Math.sin(angle) };
  });

  // Agents — mid ring
  const agents = ["character_creator", "outline_generator", "cover_designer", "summary_writer", "text_formatter", "title_suggester", "marketing_assistant", "bookstore_advisor", "brand_strategist"];
  agents.forEach((id, i) => {
    const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2;
    positions[id] = { x: cx + 260 * Math.cos(angle), y: cy + 200 * Math.sin(angle) };
  });

  // Media specialists — right side
  const media = ["video_producer", "audiobook_producer", "media_production"];
  media.forEach((id, i) => {
    positions[id] = { x: cx + 350 + (i % 2) * 80, y: cy - 60 + i * 80 };
  });

  // Maintenance — bottom
  const maint = ["ethical_ai_officer", "diagnostics_agent", "membership_manager"];
  maint.forEach((id, i) => {
    const angle = Math.PI / 2 + ((i - 1) * 0.35);
    positions[id] = { x: cx + 340 * Math.cos(angle), y: cy + 260 * Math.sin(angle) };
  });

  // Advisors — outer ring top arc
  const advisors = ["advisory_tyler_perry", "advisory_thurgood_marshall", "advisory_toni_morrison", "advisory_shonda_rhimes", "advisory_jk_rowling", "advisory_slade_kevin_morrison"];
  advisors.forEach((id, i) => {
    const angle = ((i / (advisors.length - 1)) - 0.5) * Math.PI * 1.2 - Math.PI / 2;
    positions[id] = { x: cx + 420 * Math.cos(angle), y: cy + 320 * Math.sin(angle) };
  });

  return positions;
}

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All", icon: Layers },
  { value: "advisor", label: "Advisors", icon: Star },
  { value: "executive", label: "Executives", icon: Crown },
  { value: "manager", label: "Agents", icon: Bot },
  { value: "specialist", label: "Specialists", icon: Users },
  { value: "maintenance", label: "Compliance", icon: Filter },
];

export default function AgentConnectionMap() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState(null);
  const svgRef = useRef(null);
  const W = 1200, H = 900;

  const positions = useMemo(() => computeLayout(W, H), []);

  const filteredAgents = filterRole === "all" ? ALL_AGENTS : ALL_AGENTS.filter(a => a.role === filterRole);
  const filteredIds = new Set(filteredAgents.map(a => a.id));

  const visibleConnections = CONNECTIONS.filter(c => filteredIds.has(c.from) && filteredIds.has(c.to));

  const getConnections = (agentId) => {
    const connectedIds = new Set();
    CONNECTIONS.forEach(c => {
      if (c.from === agentId) connectedIds.add(c.to);
      if (c.to === agentId) connectedIds.add(c.from);
    });
    return ALL_AGENTS.filter(a => connectedIds.has(a.id));
  };

  const handleMouseDown = (e) => { setIsPanning(true); setLastMouse({ x: e.clientX, y: e.clientY }); };
  const handleMouseMove = (e) => {
    if (!isPanning || !lastMouse) return;
    setPan(p => ({ x: p.x + e.clientX - lastMouse.x, y: p.y + e.clientY - lastMouse.y }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => { setIsPanning(false); setLastMouse(null); };
  const resetView = () => { setZoom(0.8); setPan({ x: 0, y: 0 }); };

  const advisors = ALL_AGENTS.filter(a => a.role === "advisor");
  const aiAgents = ALL_AGENTS.filter(a => ["executive", "manager", "specialist"].includes(a.role));
  const totalConnections = CONNECTIONS.length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Agent Connection Map</h1>
              <p className="text-white/30 text-xs">Advisory Board · AI Agents · Hierarchy Connections</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10">
              {ROLE_FILTER_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.value} onClick={() => setFilterRole(opt.value)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      filterRole === opt.value ? "bg-amber-500/20 text-amber-300" : "text-white/40 hover:text-white/70")}>
                    <Icon className="w-3 h-3" /> {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} className="h-8 w-8 text-white/50 hover:text-white">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))} className="h-8 w-8 text-white/50 hover:text-white">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={resetView} className="h-8 w-8 text-white/50 hover:text-white" title="Reset view">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 px-6 py-3 bg-slate-900/40 border-b border-white/5 flex-wrap">
        {[
          { label: "Advisory Board", value: advisors.length, color: "text-indigo-400" },
          { label: "AI Agents", value: aiAgents.length, color: "text-emerald-400" },
          { label: "Total Connections", value: totalConnections, color: "text-amber-400" },
          { label: "Advisory Links", value: CONNECTIONS.filter(c => c.type === "advisory").length, color: "text-indigo-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={cn("font-bold text-sm", color)}>{value}</span>
            <span className="text-white/30 text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVG Canvas */}
        <div className="flex-1 overflow-hidden relative bg-slate-950"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}>

          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <svg ref={svgRef} width="100%" height="100%" style={{ userSelect: "none" }}>
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

              {/* Connection lines */}
              {visibleConnections.map((conn, i) => {
                const from = positions[conn.from];
                const to = positions[conn.to];
                if (!from || !to) return null;
                const isAdvisory = conn.type === "advisory";
                const isActive = selectedAgent && (conn.from === selectedAgent.id || conn.to === selectedAgent.id);
                return (
                  <line key={i}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isAdvisory ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.12)"}
                    strokeWidth={isActive ? (isAdvisory ? 3 : 2) : (isAdvisory ? 1.5 : 1)}
                    strokeDasharray={isAdvisory ? "6 3" : undefined}
                    opacity={selectedAgent && !isActive ? 0.15 : 1}
                    style={{ transition: "opacity 0.2s" }}
                  />
                );
              })}

              {/* Nodes */}
              {filteredAgents.map(agent => {
                const pos = positions[agent.id];
                if (!pos) return null;
                const isSelected = selectedAgent?.id === agent.id;
                const isConnected = selectedAgent && getConnections(selectedAgent.id).some(c => c.id === agent.id);
                const dimmed = selectedAgent && !isSelected && !isConnected;
                return (
                  <g key={agent.id} opacity={dimmed ? 0.2 : 1} style={{ transition: "opacity 0.2s" }}>
                    <ConnectionNode
                      agent={agent}
                      x={pos.x} y={pos.y}
                      isSelected={isSelected}
                      onClick={(a) => setSelectedAgent(isSelected ? null : a)}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs space-y-1.5">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Legend</p>
            {[
              { color: "rgba(255,255,255,0.25)", dash: false, label: "Hierarchy link" },
              { color: "rgba(99,102,241,0.7)", dash: true, label: "Advisory link" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <svg width={28} height={8}>
                  <line x1={0} y1={4} x2={28} y2={4} stroke={l.color} strokeWidth={1.5} strokeDasharray={l.dash ? "4 2" : undefined} />
                </svg>
                <span className="text-white/40">{l.label}</span>
              </div>
            ))}
            <div className="border-t border-white/8 pt-1.5 mt-1.5 space-y-1">
              {[
                { color: "#f59e0b", label: "Owner" },
                { color: "#3b82f6", label: "Executive" },
                { color: "#10b981", label: "Agent" },
                { color: "#6366f1", label: "Advisor" },
                { color: "#64748b", label: "Compliance" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-white/40">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/30">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden shrink-0 h-full"
              style={{ height: "100%" }}
            >
              <AgentDetailCard
                agent={selectedAgent}
                onClose={() => setSelectedAgent(null)}
                connections={getConnections(selectedAgent.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}