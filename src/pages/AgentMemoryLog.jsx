import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Search,
  Trash2,
  Archive,
  BarChart3,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  MessageSquare,
  Target,
  Clock,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = [
  "media_production", "video_producer", "audiobook_producer", "project_manager",
  "brand_strategist", "marketing_assistant", "cover_designer", "outline_generator",
  "summary_writer", "character_creator", "title_suggester", "seo_growth_engine",
  "lead_magnet_designer", "bookstore_advisor", "brand_guardian", "brand_sentinel",
  "structure_sentinel", "text_formatter", "seasonal_newsletter_strategist",
  "diagnostics_agent", "media_production"
];

const MEMORY_TYPE_CONFIG = {
  observation:     { color: "bg-blue-500/20 text-blue-300 border-blue-500/30",    icon: MessageSquare },
  decision:        { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Target },
  error:           { color: "bg-red-500/20 text-red-300 border-red-500/30",        icon: AlertTriangle },
  optimization:    { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: Zap },
  task_completed:  { color: "bg-green-500/20 text-green-300 border-green-500/30",  icon: CheckCircle2 },
  escalation:      { color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: AlertTriangle },
  context:         { color: "bg-slate-500/20 text-slate-300 border-slate-500/30",  icon: Brain }
};

const IMPORTANCE_COLOR = {
  critical: "bg-red-500 text-white",
  high:     "bg-orange-500/20 text-orange-300",
  medium:   "bg-amber-500/20 text-amber-300",
  low:      "bg-slate-500/20 text-slate-400"
};

function MemoryCard({ memory, onArchive }) {
  const [expanded, setExpanded] = useState(false);
  const config = MEMORY_TYPE_CONFIG[memory.memory_type] || MEMORY_TYPE_CONFIG.observation;
  const Icon = config.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge className={`text-xs ${config.color}`}>{memory.memory_type}</Badge>
                <Badge className={`text-xs ${IMPORTANCE_COLOR[memory.importance]}`}>{memory.importance}</Badge>
                {memory.related_entity_type && (
                  <Badge className="text-xs bg-white/10 text-white/50 border-0">{memory.related_entity_type}</Badge>
                )}
                <span className="text-xs text-white/30 ml-auto">
                  {new Date(memory.created_date).toLocaleString()}
                </span>
              </div>
              <p className={`text-sm text-white/80 leading-relaxed ${!expanded && "line-clamp-2"}`}>
                {memory.content}
              </p>
              {memory.content.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-amber-400/70 hover:text-amber-400 mt-1 flex items-center gap-1"
                >
                  {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                </button>
              )}
              {expanded && memory.embedding_keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memory.embedding_keywords.map(k => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">{k}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> recalled {memory.recalled_count || 0}×
                </span>
                {memory.session_id && (
                  <span className="text-xs text-white/30">session: {memory.session_id}</span>
                )}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onArchive(memory.id)}
              className="text-white/20 hover:text-red-400 hover:bg-red-500/10 w-7 h-7 flex-shrink-0"
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AgentMemoryLog() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  // Fetch memories
  const { data: memoriesData, isLoading } = useQuery({
    queryKey: ["agent-memories", selectedAgent, filterType],
    queryFn: async () => {
      const payload = { action: "list", per_page: 100, include_archived: false };
      if (selectedAgent !== "all") payload.agent_name = selectedAgent;
      if (filterType !== "all") payload.memory_type = filterType;
      const res = await base44.functions.invoke("agentMemory", payload);
      return res.data;
    }
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["agent-memory-stats"],
    queryFn: async () => {
      const res = await base44.functions.invoke("agentMemory", { action: "stats" });
      return res.data;
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (memory_id) => base44.functions.invoke("agentMemory", { action: "archive", memory_id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agent-memories"] })
  });

  const clearMutation = useMutation({
    mutationFn: (agent_name) => base44.functions.invoke("agentMemory", { action: "clear", agent_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-memories"] });
      queryClient.invalidateQueries({ queryKey: ["agent-memory-stats"] });
    }
  });

  const handleSemanticSearch = async () => {
    if (!searchQuery || selectedAgent === "all") return;
    setSearching(true);
    try {
      const res = await base44.functions.invoke("agentMemory", {
        action: "recall",
        agent_name: selectedAgent,
        query: searchQuery,
        limit: 20
      });
      setSearchResults(res.data?.results || []);
    } finally {
      setSearching(false);
    }
  };

  const memories = memoriesData?.memories || [];
  const stats = statsData?.stats || {};
  const totalMemories = statsData?.total_memories || 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-amber-400" />
            Agent Memory Log
          </h1>
          <p className="text-white/50 mt-1">Persistent memory store for all AI agents — {totalMemories} entries</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="logs" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <MessageSquare className="w-4 h-4 mr-2" /> Memory Logs
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Search className="w-4 h-4 mr-2" /> Semantic Recall
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <BarChart3 className="w-4 h-4 mr-2" /> Stats
          </TabsTrigger>
        </TabsList>

        {/* ── LOGS TAB ── */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">All Agents</option>
              {AGENTS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">All Types</option>
              {Object.keys(MEMORY_TYPE_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {selectedAgent !== "all" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirm(`Archive ALL memories for ${selectedAgent}?`) && clearMutation.mutate(selectedAgent)}
                disabled={clearMutation.isPending}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                {clearMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                Clear Agent
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["agent-memories"] })}
              className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          {/* Memory List */}
          {isLoading ? (
            <div className="py-12 text-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" /></div>
          ) : memories.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No memory entries yet for the selected filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Group by agent */}
              {Object.entries(
                memories.reduce((acc, m) => {
                  if (!acc[m.agent_name]) acc[m.agent_name] = [];
                  acc[m.agent_name].push(m);
                  return acc;
                }, {})
              ).map(([agent, agentMems]) => (
                <div key={agent} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">{agent.replace(/_/g, " ")}</span>
                    <Badge className="bg-white/10 text-white/50 border-0 text-xs">{agentMems.length}</Badge>
                  </div>
                  {agentMems.map(mem => (
                    <MemoryCard key={mem.id} memory={mem} onArchive={(id) => archiveMutation.mutate(id)} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── SEARCH TAB ── */}
        <TabsContent value="search" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-4 space-y-3">
              <p className="text-sm text-white/50">Semantic recall searches an agent's memory using keyword similarity scoring — like a vector database query.</p>
              <div className="flex gap-3">
                <select
                  value={selectedAgent}
                  onChange={e => setSelectedAgent(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="all">Select Agent…</option>
                  {AGENTS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                </select>
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSemanticSearch()}
                  placeholder="e.g. ElevenLabs quota warning..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
                />
                <Button
                  onClick={handleSemanticSearch}
                  disabled={searching || selectedAgent === "all" || !searchQuery}
                  className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchResults && (
            <div className="space-y-2">
              <p className="text-sm text-white/40">{searchResults.length} recalled memories</p>
              {searchResults.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-8 text-center">
                    <p className="text-white/50">No relevant memories found for that query</p>
                  </CardContent>
                </Card>
              ) : (
                searchResults.map(mem => (
                  <MemoryCard key={mem.id} memory={mem} onArchive={(id) => archiveMutation.mutate(id)} />
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* ── STATS TAB ── */}
        <TabsContent value="stats" className="space-y-4">
          {Object.keys(stats).length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No memory data yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(stats).map(([agent, s]) => (
                <Card key={agent} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-400" />
                      {agent.replace(/_/g, " ")}
                      <Badge className="bg-white/10 text-white/50 border-0 ml-auto">{s.total} entries</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">By Type</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(s.by_type).map(([type, count]) => {
                          const cfg = MEMORY_TYPE_CONFIG[type];
                          return (
                            <span key={type} className={`text-xs px-2 py-0.5 rounded-full border ${cfg?.color || "bg-white/10 text-white/50"}`}>
                              {type}: {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">By Importance</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(s.by_importance).map(([imp, count]) => (
                          <span key={imp} className={`text-xs px-2 py-0.5 rounded-full ${IMPORTANCE_COLOR[imp]}`}>
                            {imp}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                    {s.most_recalled && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-white/40 mb-1">Most Recalled ({s.most_recalled.recalled_count}×)</p>
                        <p className="text-xs text-white/60 line-clamp-2">{s.most_recalled.content}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}