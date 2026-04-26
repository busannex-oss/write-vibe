import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, Eye, Settings } from "lucide-react";
import HierarchyVisualization from "@/components/chainofcommand/HierarchyVisualization";
import BrandCustomizationPanel from "@/components/chainofcommand/BrandCustomizationPanel";
import BrandBanner from "@/components/chainofcommand/BrandBanner";
import { motion } from "framer-motion";

const HIERARCHY_STRUCTURE = {
  level1: {
    name: "SYSTEM OWNER",
    agents: [
      { id: "admin", name: "Administrator", title: "SYSTEM OWNER", age: null, role: "admin", status: "active", pillars: ["Proper Business Structure"], description: "Core system governance and oversight" }
    ]
  },
  level2: {
    name: "EXECUTIVE AGENTS",
    agents: [
      { id: "brand_guardian", name: "Marcus Whitmore", title: "BRAND GUARDIAN", age: 48, role: "executive", status: "active", pillars: ["Proper Business Structure", "Strategic Application"], description: "Ensures brand compliance and consistency across all deployments" },
      { id: "automation_orchestrator", name: "Sam Johnson", title: "AUTOMATION ORCHESTRATOR", age: 42, role: "executive", status: "active", pillars: ["Business Intelligence", "Proper Business Structure"], description: "Manages workflow automation and SLA compliance" }
    ]
  },
  level3: {
    name: "DEPARTMENT MANAGERS",
    agents: [
      { id: "character_creator", name: "James Mitchell", title: "CHARACTER CREATOR", age: 35, role: "manager", status: "active", pillars: ["Progressive Development"], description: "Designs complex characters with psychological depth" },
      { id: "outline_generator", name: "Olivia Rodriguez", title: "OUTLINE GENERATOR", age: 38, role: "manager", status: "active", pillars: ["Strategic Application", "Business Intelligence"], description: "Develops structured story roadmaps and narrative architecture" },
      { id: "cover_designer", name: "Derek Thompson", title: "COVER DESIGNER", age: 45, role: "manager", status: "active", pillars: ["Strategic Application", "Exemplary Customer Service"], description: "Creates market-driven, visually compelling cover designs" },
      { id: "marketing_assistant", name: "Priya Patel", title: "MARKETING ASSISTANT", age: 32, role: "manager", status: "active", pillars: ["Wealth Strategies Trajectory", "Partnership Alignment"], description: "Orchestrates multi-channel book launches and campaigns" }
    ]
  },
  level4: {
    name: "SYSTEM MAINTENANCE",
    agents: [
      { id: "ethical_ai_officer", name: "Dr. Samantha Brooks", title: "ETHICAL AI OFFICER & MEMORY GUARDIAN", age: 51, role: "maintenance", status: "active", pillars: ["Proper Business Structure", "Business Intelligence"], description: "Enforces safety, compliance, and ethical AI standards" }
    ]
  },
  level5: {
    name: "SPECIALIZED INTELLIGENCE NODES",
    agents: [
      { id: "title_suggester", name: "Lexie Chen", title: "SEO STRATEGIST", age: 34, role: "specialist", status: "active", pillars: ["Predictive Analysis", "Business Intelligence"], description: "Creates market-ready titles with SEO and emotional resonance" },
      { id: "summary_writer", name: "Rachel Chen", title: "COPYWRITER", age: 36, role: "specialist", status: "active", pillars: ["Exemplary Customer Service", "Wealth Strategies Trajectory"], description: "Crafts conversion-focused marketing copy" },
      { id: "video_producer", name: "Chloe Martinez", title: "VIDEO PRODUCER", age: 29, role: "specialist", status: "active", pillars: ["Progressive Development", "Strategic Application"], description: "Creates high-converting video commercials for social platforms" },
      { id: "bookstore_advisor", name: "Nathan Brooks", title: "DISTRIBUTION STRATEGIST", age: 47, role: "specialist", status: "active", pillars: ["Partnership Alignment", "Wealth Strategies Trajectory"], description: "Maximizes book sales through data-driven channel planning" },
      { id: "project_manager", name: "Alexandra Turner", title: "PROJECT MANAGER", age: 40, role: "specialist", status: "active", pillars: ["Proper Business Structure", "Strategic Application"], description: "Coordinates cross-functional workflows and timelines" },
      { id: "audiobook_producer", name: "Michael Chen", title: "AUDIO ENGINEER", age: 38, role: "specialist", status: "active", pillars: ["Progressive Development", "Exemplary Customer Service"], description: "Produces high-quality audiobook narrations and production" }
    ]
  }
};

const PILLARS = [
  "Predictive Analysis",
  "Business Intelligence",
  "Partnership Alignment",
  "Proper Business Structure",
  "Strategic Application",
  "Wealth Strategies Trajectory",
  "Progressive Development",
  "Exemplary Customer Service"
];

export default function ChainOfCommand() {
  const [user, setUser] = useState(null);
  const [brandGuide, setBrandGuide] = useState(null);
  const [deploymentMode, setDeploymentMode] = useState("core"); // core, whitelabel
  const [viewMode, setViewMode] = useState("live"); // live, preview
  const [brandCustomization, setBrandCustomization] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [agents, setAgents] = useState(HIERARCHY_STRUCTURE);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setDeploymentMode(userData?.subscription_tier === "white_label" ? "whitelabel" : "core");
      
      if (userData?.subscription_tier !== "white_label") {
        await loadBrandGuide();
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadBrandGuide = async () => {
    try {
      const guides = await base44.entities.BrandStyleGuide.filter({ is_current: true });
      if (guides.length > 0) {
        setBrandGuide(guides[0]);
      }
    } catch (error) {
      console.error("Error loading brand guide:", error);
    }
  };

  const extractBrandColors = () => {
    if (deploymentMode === "whitelabel" && brandCustomization) {
      return brandCustomization;
    }

    if (brandGuide?.brand_data?.colors) {
      const colors = brandGuide.brand_data.colors;
      return {
        primary: colors.find(c => c.role === "primary")?.hex || "#f59e0b",
        secondary: colors.find(c => c.role === "secondary")?.hex || "#1f2937",
        accent: colors.find(c => c.role === "accent")?.hex || "#3b82f6",
        background: colors.find(c => c.role === "background")?.hex || "#0f172a",
        text: colors.find(c => c.role === "text")?.hex || "#ffffff"
      };
    }

    return {
      primary: "#f59e0b",
      secondary: "#1f2937",
      accent: "#3b82f6",
      background: "#0f172a",
      text: "#ffffff"
    };
  };

  const getAllAgents = () => {
    return Object.values(agents).flatMap(level => level.agents);
  };

  const getFilteredAgents = () => {
    let filtered = getAllAgents();

    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.pillars.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    return filtered;
  };

  const activeAgentCount = getAllAgents().filter(a => a.status === "active").length;
  const inDevCount = getAllAgents().filter(a => a.status === "in_development").length;
  const totalAgents = getAllAgents().length;

  const brandColors = extractBrandColors();
  const isGuideIncomplete = deploymentMode === "core" && !brandGuide;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: brandColors.background }}>
      <style>{`
        :root {
          --chain-primary: ${brandColors.primary};
          --chain-secondary: ${brandColors.secondary};
          --chain-accent: ${brandColors.accent};
          --chain-text: ${brandColors.text};
        }
      `}</style>

      {isGuideIncomplete && <BrandBanner />}

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-2" style={{ color: brandColors.text }}>
          CHAIN OF COMMAND
        </h1>
        <p className="text-lg" style={{ color: brandColors.text + "80" }}>
          ORGANIZATIONAL HIERARCHY NODE
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: brandColors.accent }} />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white"
              style={{
                borderColor: brandColors.accent + "30",
                backgroundColor: brandColors.secondary + "40"
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {deploymentMode === "whitelabel" && (
            <Button
              onClick={() => setShowCustomization(!showCustomization)}
              className="gap-2"
              style={{ backgroundColor: brandColors.accent }}
            >
              <Settings className="w-4 h-4" />
              Customize Brand
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2"
            style={{ borderColor: brandColors.accent + "50", color: brandColors.accent }}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Widget */}
      <Card className="mb-8" style={{ backgroundColor: brandColors.secondary + "60", borderColor: brandColors.accent + "40" }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm" style={{ color: brandColors.text + "80" }}>Total Agents</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.accent }}>{totalAgents}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: brandColors.text + "80" }}>Active</p>
              <p className="text-2xl font-bold text-green-400">{activeAgentCount}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: brandColors.text + "80" }}>In Development</p>
              <p className="text-2xl font-bold text-yellow-400">{inDevCount}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: brandColors.text + "80" }}>System Health</p>
              <p className="text-2xl font-bold text-green-400">98%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* White Label Customization */}
      {showCustomization && deploymentMode === "whitelabel" && (
        <BrandCustomizationPanel
          onSave={(customization) => {
            setBrandCustomization(customization);
            setShowCustomization(false);
          }}
          onCancel={() => setShowCustomization(false)}
          currentCustomization={brandCustomization}
          agents={agents}
          onAgentsUpdate={setAgents}
          brandColors={brandColors}
        />
      )}

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="mb-8" style={{ backgroundColor: brandColors.secondary + "60" }}>
          <TabsTrigger value="live">Live View</TabsTrigger>
          {deploymentMode === "whitelabel" && <TabsTrigger value="preview">Preview</TabsTrigger>}
        </TabsList>

        <TabsContent value="live">
          <HierarchyVisualization
            hierarchy={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            brandColors={brandColors}
            deploymentMode={deploymentMode}
            pillars={PILLARS}
          />
        </TabsContent>

        {deploymentMode === "whitelabel" && (
          <TabsContent value="preview">
            <p style={{ color: brandColors.text }} className="text-center py-8">
              Preview mode showing customized branding
            </p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}