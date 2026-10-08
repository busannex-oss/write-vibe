import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, User, Map, Lightbulb, RefreshCw, Loader2,
  ChevronDown, ChevronUp, Search, Sparkles, Brain, Wand2
} from "lucide-react";

const INSIGHT_TYPES = [
  { key: "character",  label: "Characters",  icon: User,       color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { key: "plot",       label: "Plot",         icon: Map,        color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { key: "theme",      label: "Themes",       icon: Lightbulb,  color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { key: "world",      label: "World",        icon: Sparkles,   color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

function InsightCard({ insight, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const typeConfig = INSIGHT_TYPES.find(t => t.key === insight.type) || INSIGHT_TYPES[0];
  const Icon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeConfig.color.split(" ")[0]}`}>
          <Icon className={`w-3.5 h-3.5 ${typeConfig.color.split(" ")[1]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white/80">{insight.agent_name.replace(/_/g, " ")}</span>
            <Badge className={`text-xs border ${typeConfig.color} py-0`}>{typeConfig.label}</Badge>
            {insight.importance === "high" || insight.importance === "critical" ? (
              <Badge className="text-xs bg-red-500/20 text-red-300 border-red-500/30 py-0">{insight.importance}</Badge>
            ) : null}
          </div>
          <p className={`text-xs text-white/60 mt-1 leading-relaxed ${!open && "line-clamp-2"}`}>
            {insight.content}
          </p>
        </div>
        <div className="shrink-0 text-white/30 mt-0.5">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {open && insight.keywords?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="px-4 pb-3 pt-2 flex flex-wrap gap-1">
              {insight.keywords.map((k, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">{k}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgentInsightGroup({ agentId, agentName, insights, brandColors }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 text-left"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <span className="text-sm font-semibold" style={{ color: brandColors?.accent || "#f59e0b" }}>
          {agentName.replace(/_/g, " ")}
        </span>
        <Badge className="bg-white/10 text-white/50 border-0 text-xs">{insights.length}</Badge>
        <div className="ml-auto text-white/30">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 ml-4 mb-3">
              {insights.map((ins, i) => (
                <InsightCard key={i} insight={ins} defaultOpen={i === 0 && insights.length === 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AgentBookInsights({ book, agentId, brandColors, maxHeight = "500px" }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInsights();
  }, [book?.id, agentId]);

  const loadInsights = async () => {
    if (!book?.id) return;
    setLoading(true);
    try {
      // Load memories related to this book, tagged with character/plot/theme/world
      const payload = { action: "list", per_page: 100, include_archived: false };
      if (agentId) payload.agent_name = agentId;
      const res = await base44.functions.invoke("agentMemory", payload);
      const allMemories = res.data?.memories || [];

      // Filter memories that are book-relevant by looking at tags, entity type, or content keywords
      const bookKeywords = [
        book.title?.toLowerCase(),
        ...(book.characters || []).map(c => c.name?.toLowerCase()).filter(Boolean),
        "character", "plot", "chapter", "story", "protagonist", "antagonist",
        "theme", "scene", "narrative", "arc", "world", "setting"
      ].filter(Boolean);

      const bookInsights = allMemories
        .filter(mem => {
          const content = mem.content.toLowerCase();
          const keywords = (mem.embedding_keywords || []).join(" ").toLowerCase();
          return bookKeywords.some(kw => content.includes(kw) || keywords.includes(kw)) ||
            mem.related_entity_type === "Book" ||
            mem.related_entity_id === book.id;
        })
        .map(mem => {
          // Classify the insight type
          const content = mem.content.toLowerCase();
          let type = "theme";
          if (content.includes("character") || content.includes("protagonist") || content.includes("antagonist") ||
            content.includes("backstory") || content.includes("personality") || content.includes("persona")) {
            type = "character";
          } else if (content.includes("plot") || content.includes("chapter") || content.includes("scene") ||
            content.includes("arc") || content.includes("narrative") || content.includes("story")) {
            type = "plot";
          } else if (content.includes("world") || content.includes("setting") || content.includes("location") ||
            content.includes("environment") || content.includes("universe")) {
            type = "world";
          }

          return {
            id: mem.id,
            agent_name: mem.agent_name,
            content: mem.content,
            type,
            keywords: mem.embedding_keywords || [],
            importance: mem.importance,
            created_date: mem.created_date,
          };
        });

      setInsights(bookInsights);
    } catch (_) {
      setInsights([]);
    }
    setLoading(false);
  };

  const generateInsights = async () => {
    if (!book?.id) return;
    setGenerating(true);
    try {
      // Use LLM to extract key insights from book data and write them to agent memory
      const characters = (book.characters || []).slice(0, 5);
      const chapters = (book.detailed_outline || book.outline || []).slice(0, 5);

      const insightPrompt = `Analyze this book and extract key insights for the AI agent system:

Title: ${book.title}
Genre: ${book.category || "Fiction"}
Summary: ${book.book_summary || book.plot_summary || "Not provided"}
Characters: ${characters.map(c => `${c.name} (${c.role}): ${c.description}`).join("; ")}
Key Plot Points: ${chapters.map(c => `Ch.${c.chapter_number} "${c.chapter_title}": ${c.summary}`).join("; ")}

Generate 6 specific insights across these categories:
- 2 character insights (personality, motivations, relationships)
- 2 plot insights (key conflicts, turning points, narrative arc)
- 1 theme insight (core themes and messages)
- 1 world-building insight (setting, atmosphere)

Return JSON:
{
  "insights": [
    {
      "category": "character|plot|theme|world",
      "agent": "character_creator|outline_generator|marketing_assistant|summary_writer",
      "content": "<detailed insight>",
      "importance": "high|medium",
      "keywords": ["kw1", "kw2", "kw3"]
    }
  ]
}`;

      const result = await ai.InvokeLLM({
        prompt: insightPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "object" } }
          }
        }
      });

      // Write each insight to agent memory
      const writePromises = (result?.insights || []).map(ins =>
        base44.functions.invoke("agentMemory", {
          action: "write",
          agent_name: ins.agent || "character_creator",
          memory_type: "observation",
          content: ins.content,
          related_entity_id: book.id,
          related_entity_type: "Book",
          importance: ins.importance || "medium",
          tags: [ins.category, "book_insight", book.title?.toLowerCase().replace(/\s+/g, "_")]
        })
      );

      await Promise.allSettled(writePromises);
      await loadInsights();
    } catch (_) {}
    setGenerating(false);
  };

  // Filter insights
  const filtered = insights.filter(ins => {
    const matchType = filterType === "all" || ins.type === filterType;
    const matchSearch = !searchQuery || ins.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Group by agent
  const byAgent = filtered.reduce((acc, ins) => {
    if (!acc[ins.agent_name]) acc[ins.agent_name] = [];
    acc[ins.agent_name].push(ins);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-36">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/30" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="pl-8 h-8 text-xs bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${filterType === "all" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}
          >
            All
          </button>
          {INSIGHT_TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${filterType === t.key ? t.color + " border" : "text-white/40 hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={loadInsights} disabled={loading}
          className="h-8 px-2 text-white/40 hover:text-white">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 space-y-4">
          <Brain className="w-10 h-10 text-white/15 mx-auto" />
          <div>
            <p className="text-sm text-white/40 mb-1">No book insights found yet</p>
            <p className="text-xs text-white/25">Generate AI insights from your book's characters and plot data</p>
          </div>
          <Button onClick={generateInsights} disabled={generating}
            className="bg-amber-500 hover:bg-amber-600 text-black border-0 text-sm">
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Book...</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" />Generate Book Insights</>
            )}
          </Button>
        </div>
      ) : (
        <div
          className="overflow-y-auto space-y-1 pr-1"
          style={{ maxHeight }}
        >
          {/* Stats row */}
          <div className="flex gap-3 mb-3 flex-wrap">
            {INSIGHT_TYPES.map(t => {
              const count = insights.filter(i => i.type === t.key).length;
              if (!count) return null;
              const Icon = t.icon;
              return (
                <div key={t.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${t.color}`}>
                  <Icon className="w-3 h-3" />{count} {t.label}
                </div>
              );
            })}
            <Button onClick={generateInsights} disabled={generating} size="sm" variant="ghost"
              className="ml-auto h-6 text-xs text-white/40 hover:text-white px-2">
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              <span className="ml-1">Refresh Insights</span>
            </Button>
          </div>

          {/* Insights grouped by agent */}
          {Object.entries(byAgent).map(([agentName, agentInsights]) => (
            <AgentInsightGroup
              key={agentName}
              agentId={agentName}
              agentName={agentName}
              insights={agentInsights}
              brandColors={brandColors}
            />
          ))}
        </div>
      )}
    </div>
  );
}