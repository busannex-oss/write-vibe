import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import {
  Crown, ShieldAlert, Brain, Target, ClipboardList, BookOpen, Map, 
  LayoutGrid, Palette, BarChart2, GitBranch, Layers, Bot, Scale, FileKey
} from "lucide-react";

const ADMIN_TABS = [
  {
    id: "operations",
    label: "Operations",
    description: "System management & diagnostics",
    items: [
      { name: "User Management", href: "UserManagement", icon: Crown },
      { name: "Error Dashboard", href: "ErrorDashboard", icon: ShieldAlert },
      { name: "Agent Memory", href: "AgentMemoryLog", icon: Brain },
    ]
  },
  {
    id: "governance",
    label: "Governance",
    description: "Policies & procedures",
    items: [
      { name: "Legal Documents", href: "LegalDocuments", icon: Scale },
      { name: "Licensing Terms", href: "LicensingTerms", icon: FileKey },
      { name: "SOPs", href: "SOPs", icon: ClipboardList },
    ]
  },
  {
    id: "reference",
    label: "Reference",
    description: "Documentation & guides",
    items: [
      { name: "Master Registry", href: "MasterRegistry", icon: BookOpen },
      { name: "Map Legend", href: "MapLegend", icon: Map },
      { name: "Brand Style Guide", href: "BrandStyleGuide", icon: Palette },
      { name: "Sitemap", href: "Sitemap", icon: Map },
    ]
  },
  {
    id: "strategy",
    label: "Strategy",
    description: "Planning & alignment",
    items: [
      { name: "Mission Statement", href: "MissionStatement", icon: Target },
      { name: "Pillar Alignment", href: "PillarAlignment", icon: LayoutGrid },
      { name: "System Architecture", href: "SystemArchitecture", icon: Crown },
      { name: "KPI Framework", href: "KPIFramework", icon: BarChart2 },
      { name: "Pillars Architecture", href: "PillarsArchitecture", icon: Layers },
      { name: "Version Roadmap", href: "VersionRoadmap", icon: GitBranch },
      { name: "Onboarding Experience", href: "OnboardingExperience", icon: Crown },
      { name: "AI Agent Audit", href: "AgentAudit", icon: Bot },
    ]
  },
];

export default function AdminNavTabs({ currentPageName, onItemClick }) {
  const [activeTab, setActiveTab] = useState("operations");

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
              activeTab === tab.id
                ? "text-amber-400 border-amber-400/60 bg-amber-400/5"
                : "text-white/40 border-transparent hover:text-white/60"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {ADMIN_TABS.map(tab => (
        activeTab === tab.id && (
          <div key={tab.id} className="space-y-2">
            <p className="text-xs text-white/30 px-1">{tab.description}</p>
            <div className="grid grid-cols-2 gap-2">
              {tab.items.map(item => {
                const isActive = currentPageName === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.href)}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium",
                      isActive
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-amber/60 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )
      ))}
    </div>
  );
}